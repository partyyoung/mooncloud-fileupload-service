package net.mooncloud.fileupload.service;

import java.io.BufferedReader;
import java.io.File;
import java.io.IOException;
import java.io.InputStreamReader;
import java.nio.file.DirectoryStream;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.text.SimpleDateFormat;
import java.util.ArrayList;
import java.util.Collections;
import java.util.Comparator;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;

@Service
@ConfigurationProperties(prefix = "file-upload-service.fs")
public class FileUploadFSService {

	@Autowired
	private FileUploadService fileUploadService;

	private static final SimpleDateFormat sdf = new SimpleDateFormat("yyyy-MM-dd'T'HH:mm:ss");

	private static final String ORDERBY = "lastModifiedTime:desc;name:desc";
	private static final String ORDERBYDESC = "DESC";
	private static final String ORDERBYASC = "ASC";

	public Map<String, Object> ls(String path) throws Exception {
		return ls(Paths.get(path), ORDERBY);
	}

	public Map<String, Object> ls(String path, String orderby) throws Exception {
		return ls(Paths.get(path), orderby);
	}

	public Map<String, Object> ls(Path path) throws Exception {
		return ls(path, ORDERBY);
	}

	public Map<String, Object> ls(Path path, String orderby) throws Exception {
		Map<String, Object> r = new HashMap<String, Object>(2);
		List<Map> fileList = new ArrayList<Map>();
		List<Map> directoryList = new ArrayList<Map>();
		r.put("files", fileList);
		r.put("directorys", directoryList);

		// getDeletable
		Map<String, Boolean> fileDetetableMap = new HashMap<String, Boolean>(1);
		try {
			ArrayList<String> IN_LIST = execCmd("lsattr " + path.toString(), null).get(0);
			for (String inStr : IN_LIST) {
				String[] attrFile = inStr.split(" ", 2);
				char a = attrFile[0].toCharArray()[5];
				if (a == 'a') {
					fileDetetableMap.put(attrFile[1], false);
				}
			}
		} catch (Exception e) {
			// e.printStackTrace();
		}

		// getFileAttributes
		try (DirectoryStream<Path> stream = Files.newDirectoryStream(path)) {
			for (Path e : stream) {
				Map fileAttributes = getFileAttributes(e);
				if ((boolean) fileAttributes.get("isDirectory")) {
					directoryList.add(fileAttributes);
				} else {
					fileList.add(fileAttributes);
				}
				if (fileDetetableMap.containsKey(fileAttributes.get("absolutePath").toString())) {
					fileAttributes.put("deletable", false);
				}
			}
		} catch (IOException e) {
			throw e;
		}

		String pathStr = path.toString();
		pathStr = pathStr.startsWith(fileUploadService.getFileHttpRoot())
				? pathStr.substring(fileUploadService.getFileHttpRoot().length())
				: pathStr;
		r.put("path", pathStr);
		int pid = pathStr.lastIndexOf('/');
		String parentPath = pid == -1 ? pathStr : pathStr.substring(0, pid);
		r.put("parentPath", parentPath);

		// sort
		String[] orderbys = orderby.split(";");
		sort(directoryList, orderbys);
		sort(fileList, orderbys);

		return r;
	}

	private void sort(List<Map> fileList, String[] orderbys) {
		Collections.sort(fileList, new Comparator<Map>() {
			public int compare(Map fileAttributes, Map otherFileAttributes) {
				for (String ob : orderbys) {
					String[] obs = ob.split(":");
					String order = obs[0];
					String desc = obs.length < 2 ? ORDERBYASC : obs[1].toUpperCase();
					if (!fileAttributes.containsKey(order)) {
						continue;
					}
					int compare = ((Comparable) fileAttributes.get(order))
							.compareTo((Comparable) otherFileAttributes.get(order));
					if (compare != 0) {
						return compare * (ORDERBYDESC.equals(desc) ? -1 : 1);
					}
				}
				return 0;
			}
		});
	}

	public Map<String, Object> mkdir(String path) throws Exception {
		return mkdir(Paths.get(path));
	}

	public Map<String, Object> mkdir(Path path) throws Exception {
		Files.createDirectory(path);
		return ls(path.getParent());
	}

	public long rmr(String path, String[] names) throws Exception {
		long count = 0;
		for (String name : names) {
			if (StringUtils.isEmpty(name.trim())) {
				continue;
			}
			count += rmr(Paths.get(path, name));
		}
		return count;
	}

	public long rmr(String path) throws Exception {
		return rmr(Paths.get(path));
	}

	public long rmr(Path path) throws Exception {
		long count = 1;
		try {
			if (Files.isDirectory(path)) {
				try (DirectoryStream<Path> stream = Files.newDirectoryStream(path)) {
					for (Path e : stream) {
						count += rmr(e);
					}
				} catch (IOException e) {
					e.printStackTrace();
				}
			}
			Files.deleteIfExists(path);
		} catch (IOException e) {
			e.printStackTrace();
		}
		return count;
	}

	public long chattra(String path, String[] names, boolean deletable) throws Exception {
		long count = 0;
		for (String name : names) {
			if (StringUtils.isEmpty(name.trim())) {
				continue;
			}
			Runtime runtime = Runtime.getRuntime();
			String sign = deletable == false ? "+" : "-";
			Path path1 = Paths.get(path, name);
			String command = "chattr " + sign + "a " + path1;
			try {
				Process process = runtime.exec(command);
				process.waitFor();
				int existValue = process.exitValue();
				if (existValue == 0) {
					count += 1;

					// PosixFileAttributes attrs = Files.readAttributes(path1,
					// PosixFileAttributes.class);// 读取文件的权限
					// Set<PosixFilePermission> posixPermissions = attrs.permissions();
					// if (deletable) {
					// posixPermissions.remove(PosixFilePermission.OTHERS_WRITE);
					// } else {
					// posixPermissions.add(PosixFilePermission.OTHERS_WRITE);
					// }
					// Files.setPosixFilePermissions(path1, posixPermissions); // 设置文件的权限
				}
				// if (existValue != 0) {
				// logger.log(Level.SEVERE, "Change file permission failed.");
				// }
			} catch (Exception e) {
				e.printStackTrace();
			}
		}
		return count;
	}

	private Map<String, Object> getFileAttributes(Path path) throws Exception {
		Map<String, Object> attributes = new HashMap<String, Object>(Files.readAttributes(path, "*"));
		attributes.remove("fileKey");
		attributes.put("lastAccessTime", sdf.parse(attributes.get("lastAccessTime").toString()));
		attributes.put("lastModifiedTime", sdf.parse(attributes.get("lastModifiedTime").toString()));
		attributes.put("creationTime", sdf.parse(attributes.get("creationTime").toString()));
		File f = path.toFile();
		attributes.put("absolutePath", f.getAbsolutePath());
		attributes.put("relativePath",
				f.getAbsolutePath().startsWith(fileUploadService.getFileHttpRoot())
						? f.getAbsolutePath().substring(fileUploadService.getFileHttpRoot().length())
						: f.getAbsolutePath());
		attributes.put("name", f.getName());
		int eid = f.getName().lastIndexOf('.');
		attributes.put("extension", eid < 1 ? "" : f.getName().substring(eid + 1));

		attributes.put("deletable", true);

		return attributes;
	}

	/**
	 * 执行系统命令, 返回执行结果
	 *
	 * @param cmd
	 *            需要执行的命令
	 * @param dir
	 *            执行命令的子进程的工作目录, null 表示和当前主进程工作目录相同
	 */
	private static List<ArrayList<String>> execCmd(String cmd, File dir) throws Exception {
		// StringBuilder result = new StringBuilder();

		List<ArrayList<String>> IN_ERROR_LIST = new ArrayList<ArrayList<String>>(2);
		ArrayList<String> IN_LIST = new ArrayList<String>(1);
		ArrayList<String> ERROR_LIST = new ArrayList<String>(1);
		IN_ERROR_LIST.add(IN_LIST);
		IN_ERROR_LIST.add(ERROR_LIST);

		Process process = null;
		BufferedReader bufrIn = null;
		BufferedReader bufrError = null;

		try {
			// 执行命令, 返回一个子进程对象（命令在子进程中执行）
			process = Runtime.getRuntime().exec(cmd, null, dir);

			// 方法阻塞, 等待命令执行完成（成功会返回0）
			process.waitFor();

			// 获取命令执行结果, 有两个结果: 正常的输出 和 错误的输出（PS: 子进程的输出就是主进程的输入）
			bufrIn = new BufferedReader(new InputStreamReader(process.getInputStream(), "UTF-8"));
			bufrError = new BufferedReader(new InputStreamReader(process.getErrorStream(), "UTF-8"));

			// 读取输出
			String line = null;
			while ((line = bufrIn.readLine()) != null) {
				IN_LIST.add(line);
				// result.append(line).append('\n');
			}
			while ((line = bufrError.readLine()) != null) {
				ERROR_LIST.add(line);
				// result.append(line).append('\n');
			}

		} finally {
			if (bufrIn != null) {
				try {
					bufrIn.close();
				} catch (Exception e) {
					// nothing
				}
			}
			if (bufrError != null) {
				try {
					bufrError.close();
				} catch (Exception e) {
					// nothing
				}
			}
			// 销毁子进程
			if (process != null) {
				process.destroy();
			}
		}

		// 返回执行结果
		// return result.toString();
		return IN_ERROR_LIST;
	}

	public static void main(String[] args) throws Exception {
		// FileUploadFSService fileUploadManagerService = new FileUploadFSService();
		// Object r = fileUploadManagerService.ls("/home/yangjd/Downloads");
		// System.out.println(JSON.toJSONString(r));

		// Path path = Paths.get("/tmp/yangjd/test2");
		// PosixFileAttributes attrs = Files.readAttributes(path,
		// PosixFileAttributes.class);// 读取文件的权限
		// Set<PosixFilePermission> posixPermissions = attrs.permissions();
		// System.out.println(posixPermissions);
		//
		// UserPrincipalLookupService lookupService =
		// path.getFileSystem().getUserPrincipalLookupService();
		// UserPrincipal joe = lookupService.lookupPrincipalByName("root");
		// Files.setOwner(path, joe);
		//
		// System.out.println("img.jpg".substring("img.jpg".lastIndexOf('.') + 1));

		// boolean deletable = true;
		// Runtime runtime = Runtime.getRuntime();
		// String sign = deletable == false ? "+" : "-";
		// Path path1 = Paths.get("/tmp/yangjd/test2");
		// String command = "su -c '123456' -e 'chattr " + sign + "a " + path1 + "'";
		// System.out.println(command);
		// Process process = runtime.exec(command);
		// process.waitFor();
		// int existValue = process.exitValue();
		// System.out.println(existValue);

		// System.out.println(execCmd("lsattr /tmp/yangjd/", null).get(0).get(0).split("
		// ")[0].toCharArray()[5] == 'a');

		System.out.println(sdf.parse("2018-08-01T08:10:43").compareTo(sdf.parse("2018-08-02T08:10:43")));

	}

}

package net.mooncloud.fileupload.service;

import java.io.File;
import java.io.IOException;
import java.nio.file.DirectoryStream;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.text.SimpleDateFormat;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;

import com.alibaba.fastjson.JSON;

@Service
@ConfigurationProperties(prefix = "file-upload-service.fs")
public class FileUploadFSService {

	@Autowired
	private FileUploadService fileUploadService;

	private static final SimpleDateFormat sdf = new SimpleDateFormat("yyyy-MM-dd'T'HH:mm:ss");

	private Path basePath;

	public Map<String, Object> ls(String path) throws Exception {
		return ls(Paths.get(path));
	}

	public Map<String, Object> ls(Path path) throws Exception {
		Map<String, Object> r = new HashMap<String, Object>(2);
		List<Map> fileList = new ArrayList<Map>();
		List<Map> directoryList = new ArrayList<Map>();
		r.put("files", fileList);
		r.put("directorys", directoryList);
		try (DirectoryStream<Path> stream = Files.newDirectoryStream(path)) {
			for (Path e : stream) {
				Map fileAttributes = getFileAttributes(e);
				if ((boolean) fileAttributes.get("isDirectory")) {
					directoryList.add(fileAttributes);
				} else {
					fileList.add(fileAttributes);
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

		return r;
	}

	public Map<String, Object> mkdir(String path) throws Exception {
		return mkdir(Paths.get(path));
	}

	public Map<String, Object> mkdir(Path path) throws Exception {
		Files.createDirectory(path);
		return ls(path.getParent());
	}

	public long rmr(String path, List<String> names) throws Exception {
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
		try {
			if (Files.isDirectory(path)) {
				try (DirectoryStream<Path> stream = Files.newDirectoryStream(path)) {
					for (Path e : stream) {
						return 1 + rmr(e);
					}
				} catch (IOException e) {
					e.printStackTrace();
				}
			}
			Files.deleteIfExists(path);
		} catch (IOException e) {
			e.printStackTrace();
		}
		return 1;
	}

	private Map<String, Object> getFileAttributes(Path e) throws Exception {
		Map<String, Object> attributes = new HashMap<String, Object>(Files.readAttributes(e, "*"));
		attributes.remove("fileKey");
		attributes.put("lastAccessTime", sdf.parse(attributes.get("lastAccessTime").toString()));
		attributes.put("lastModifiedTime", sdf.parse(attributes.get("lastModifiedTime").toString()));
		attributes.put("creationTime", sdf.parse(attributes.get("creationTime").toString()));
		File f = e.toFile();
		attributes.put("absolutePath", f.getAbsolutePath());
		attributes.put("relativePath",
				f.getAbsolutePath().startsWith(fileUploadService.getFileHttpRoot())
						? f.getAbsolutePath().substring(fileUploadService.getFileHttpRoot().length())
						: f.getAbsolutePath());
		attributes.put("name", f.getName());
		int eid = f.getName().lastIndexOf('.');
		attributes.put("extension", eid < 1 ? "" : f.getName().substring(eid + 1));
		return attributes;
	}

	public static void main(String[] args) throws Exception {
		// FileUploadFSService fileUploadManagerService = new FileUploadFSService();
		// Object r = fileUploadManagerService.ls("/home/yangjd/Downloads");
		// System.out.println(JSON.toJSONString(r));

		System.out.println("img.jpg".substring("img.jpg".lastIndexOf('.') + 1));
	}

}

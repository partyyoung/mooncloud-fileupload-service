package net.mooncloud.fileupload.service;

import java.io.File;
import java.io.IOException;
import java.util.HashMap;
import java.util.Map;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import net.mooncloud.fileupload.util.MD5Hash;

@Service
@ConfigurationProperties(prefix = "file-upload-service")
public class FileUploadService {

	// private final static Logger LOGGER =
	// LoggerFactory.getLogger(FileUploadService.class);

	public Map<String, Object> uploadFile(MultipartFile multipartFile) throws IOException {
		return uploadFile(multipartFile, fileUploadPath, false, true);
	}

	public Map<String, Object> uploadFileToHttp(MultipartFile multipartFile, String path, boolean rename,
			boolean overwrite) throws IOException {
		Map<String, Object> ret = uploadFile(multipartFile, fileHttpRoot + "/" + path, rename, overwrite);
		ret.put("url",
				fileHttpUrl + ("/" + ret.get("file").toString().replaceFirst(fileHttpRoot, "")).replace("//", "/"));
		ret.put("url2",
				fileHttpUrl2 + ("/" + ret.get("file").toString().replaceFirst(fileHttpRoot, "")).replace("//", "/"));
		return ret;
	}

	public Map<String, Object> uploadFile(MultipartFile multipartFile, String path, boolean rename, boolean overwrite)
			throws IOException {

		Long start = System.currentTimeMillis();
		Map<String, Object> ret = new HashMap<String, Object>();
		ret.put("start", start);
		ret.put("originalFilename", multipartFile.getOriginalFilename());
		ret.put("contentType", multipartFile.getContentType());
		String fileName = multipartFile.getOriginalFilename();
		// InputStream inputStream = multipartFile.getInputStream();

		while (path.endsWith("/")) {
			path = path.substring(0, path.length() - 1);
		}

		if (rename) {
			StringBuilder stringBuider = new StringBuilder();
			stringBuider.append(System.currentTimeMillis()).append("-").append(MD5Hash.digest(fileName).toString16());
			int extension = fileName.indexOf('.');
			if (extension > -1) {
				stringBuider.append(fileName.substring(extension));
			}
			fileName = stringBuider.toString();
		}

		File file = new File(path + "/" + fileName);
		if (!overwrite && file.exists()) {
			throw new IOException("overwrite=false, file" + file + " already exists!");
		}
		if (!file.getParentFile().exists()) {
			file.getParentFile().mkdirs();
		}

		multipartFile.transferTo(file);

		// OutputStream outputStream = new FileOutputStream(file);
		// byte[] buff = new byte[8192];
		// int c = -1;
		// while ((c = inputStream.read(buff)) != -1) {
		// outputStream.write(buff, 0, c);
		// }
		// outputStream.close();

		Long end = System.currentTimeMillis();
		ret.put("end", end);
		ret.put("taken", end - start);
		ret.put("file", file.getAbsolutePath());
		return ret;
	}

	private String fileUploadPath;

	public String getFileUploadPath() {
		return fileUploadPath;
	}

	public void setFileUploadPath(String fileUploadPath) {
		this.fileUploadPath = fileUploadPath;
	}

	private String fileHttpRoot;

	public String getFileHttpRoot() {
		return fileHttpRoot;
	}

	public void setFileHttpRoot(String fileHttpRoot) {
		this.fileHttpRoot = fileHttpRoot;
	}

	private String fileHttpUrl;

	public String getFileHttpUrl() {
		return fileHttpUrl;
	}

	public void setFileHttpUrl(String fileHttpUrl) {
		this.fileHttpUrl = fileHttpUrl;
	}

	private String fileHttpUrl2;

	public String getFileHttpUrl2() {
		return fileHttpUrl2;
	}

	public void setFileHttpUrl2(String fileHttpUrl2) {
		this.fileHttpUrl2 = fileHttpUrl2;
	}

}

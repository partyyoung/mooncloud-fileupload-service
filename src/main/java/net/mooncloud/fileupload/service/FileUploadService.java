package net.mooncloud.fileupload.service;

import java.io.File;
import java.io.FileOutputStream;
import java.io.IOException;
import java.io.InputStream;
import java.io.OutputStream;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.stereotype.Service;
import org.springframework.util.Assert;
import org.springframework.web.multipart.MultipartFile;

@Service
@ConfigurationProperties(prefix = "file-upload-service")
public class FileUploadService {

	private final static Logger LOGGER = LoggerFactory.getLogger(FileUploadService.class);

	public Object uploadFile(MultipartFile multipartFile) throws IOException {
		return uploadFile(multipartFile, fileUploadPath);
	}

	public Object uploadFile(MultipartFile multipartFile, String path) throws IOException {
		Assert.isTrue(!multipartFile.isEmpty(), "文件为空");

		String fileName = multipartFile.getOriginalFilename();
		InputStream inputStream = multipartFile.getInputStream();

		if (path.endsWith("/")) {
			path = path.substring(0, path.length() - 1);
		}

		File file = new File(path + "/" + fileName);
		if (!file.getParentFile().exists()) {
			file.getParentFile().mkdirs();
		}

		LOGGER.info(file.getAbsolutePath());

		OutputStream outputStream = new FileOutputStream(file);
		byte[] buff = new byte[8192];
		int c = -1;
		while ((c = inputStream.read(buff)) != -1) {
			outputStream.write(buff, 0, c);
		}
		outputStream.close();
		return file.getAbsolutePath();
	}

	private String fileUploadPath;

	public String getFileUploadPath() {
		return fileUploadPath;
	}

	public void setFileUploadPath(String fileUploadPath) {
		this.fileUploadPath = fileUploadPath;
	}

}

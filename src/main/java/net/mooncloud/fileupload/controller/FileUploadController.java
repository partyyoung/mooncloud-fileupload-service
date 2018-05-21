package net.mooncloud.fileupload.controller;

import java.io.IOException;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.util.Assert;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

import net.mooncloud.fileupload.service.FileUploadService;

@RestController
@RequestMapping(value = "/file")
public class FileUploadController {

	@Autowired
	FileUploadService fileUploadService;

	@RequestMapping()
	public Object home() throws IOException {
		return "file";
	}

	@RequestMapping(value = "/upload", method = RequestMethod.POST)
	public Object uploadFile(MultipartFile file) throws IOException {
		Assert.isTrue(!file.isEmpty(), "文件为空");
		return fileUploadService.uploadFile(file);
	}

	@RequestMapping(value = "/upload2path", method = RequestMethod.POST)
	public Object uploadFileToPath(MultipartFile file, String path) throws IOException {
		Assert.isTrue(!file.isEmpty(), "文件为空");
		Assert.isTrue(path == null || !path.isEmpty(), "path为空");
		return fileUploadService.uploadFile(file, path);
	}
}

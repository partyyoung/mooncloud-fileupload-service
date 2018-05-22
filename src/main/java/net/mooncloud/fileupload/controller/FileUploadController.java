package net.mooncloud.fileupload.controller;

import java.io.IOException;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.util.Assert;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

import com.alibaba.fastjson.JSON;

import net.mooncloud.fileupload.MooncloudResponse;
import net.mooncloud.fileupload.service.FileUploadService;

@RestController
@RequestMapping(value = "/file")
public class FileUploadController {

	private final static Logger LOGGER = LoggerFactory.getLogger(FileUploadController.class);

	@Autowired
	FileUploadService fileUploadService;

	@RequestMapping()
	public Object home() throws IOException {
		return "file";
	}

	@RequestMapping(value = "/upload", method = RequestMethod.POST)
	public Object uploadFile(MultipartFile file) throws IOException {
		Assert.isTrue(file == null || !file.isEmpty(), "文件为空");
		return fileUploadService.uploadFile(file);
	}

	@RequestMapping(value = "/upload2path", method = RequestMethod.POST)
	public Object uploadFileToPath(MultipartFile file, String path) {
		MooncloudResponse mooncloudResponse = new MooncloudResponse();
		try {
			Assert.isTrue(file == null || !file.isEmpty(), "文件为空");
			Assert.isTrue(path == null || !path.isEmpty(), "path为空");
			mooncloudResponse.setBody(fileUploadService.uploadFile(file, path));
		} catch (IllegalArgumentException e) {
			mooncloudResponse.setErrorCode(MooncloudResponse.ERROR_CODE);
			mooncloudResponse.setMsg(e.toString());
		} catch (IOException e) {
			mooncloudResponse.setErrorCode(MooncloudResponse.ERROR_CODE);
			mooncloudResponse.setMsg(e.toString());
		}
		LOGGER.info(JSON.toJSONString(mooncloudResponse));
		return mooncloudResponse;
	}
}

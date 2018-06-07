package net.mooncloud.fileupload.controller;

import java.io.IOException;
import java.util.Map;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.util.Assert;
import org.springframework.util.StringUtils;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

import com.alibaba.fastjson.JSON;

import net.mooncloud.fileupload.MooncloudResponse;
import net.mooncloud.fileupload.service.FileUploadService;

@RestController
@RequestMapping(value = { "/file", "/oss" })
public class FileUploadController {

	private final static Logger LOGGER = LoggerFactory.getLogger(FileUploadController.class);

	@Autowired
	FileUploadService fileUploadService;

	@RequestMapping()
	public Object home() throws IOException {
		MooncloudResponse mooncloudResponse = new MooncloudResponse();
		mooncloudResponse.setBody("file-upload-service");
		return mooncloudResponse;
	}

	@RequestMapping(value = "/upload", method = RequestMethod.POST)
	public Object uploadFile(MultipartFile file) throws IOException {
		Assert.isTrue(file != null && !file.isEmpty(), "file文件为空");
		return fileUploadService.uploadFile(file);
	}

	@RequestMapping(value = "/upload2path", method = RequestMethod.POST)
	public Object uploadFileToPath(MultipartFile file, String path) {
		MooncloudResponse mooncloudResponse = new MooncloudResponse();
		try {
			Assert.isTrue(file != null && !file.isEmpty(), "file文件为空");
			Assert.isTrue(path != null && !path.isEmpty(), "path为空");
			mooncloudResponse.setBody(fileUploadService.uploadFile(file, path, false, true));
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

	@RequestMapping(value = "/upload2http", method = RequestMethod.POST)
	public Object uploadFileToHttp(MultipartFile file, @RequestParam(value = "path", defaultValue = "") String path,
			@RequestParam(value = "rename", defaultValue = "true") boolean rename,
			@RequestParam(value = "overwrite", defaultValue = "true") boolean overwrite) {
		MooncloudResponse mooncloudResponse = new MooncloudResponse();
		try {
			Assert.isTrue(file != null && !file.isEmpty(), "file文件为空");
			path = path == null ? "" : path;
			mooncloudResponse.setBody(fileUploadService.uploadFileToHttp(file, path, rename, overwrite));
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

	@RequestMapping(value = "/env", method = RequestMethod.GET)
	public Object showEnv() {
		MooncloudResponse mooncloudResponse = new MooncloudResponse();
		try {
			mooncloudResponse.setBody(fileUploadService);
		} catch (IllegalArgumentException e) {
			mooncloudResponse.setErrorCode(MooncloudResponse.ERROR_CODE);
			mooncloudResponse.setMsg(e.toString());
		}
		LOGGER.info(JSON.toJSONString(mooncloudResponse));
		return mooncloudResponse;
	}

	@RequestMapping(value = "/env/update", method = { RequestMethod.POST, RequestMethod.GET })
	public Object updateToHttp(@RequestParam(value = "env", defaultValue = "") String env,
			@RequestParam(value = "fileUploadPath", defaultValue = "") String fileUploadPath,
			@RequestParam(value = "fileHttpRoot", defaultValue = "") String fileHttpRoot,
			@RequestParam(value = "fileHttpUrl", defaultValue = "") String fileHttpUrl) {
		MooncloudResponse mooncloudResponse = new MooncloudResponse();
		try {
			Assert.isTrue(
					!(StringUtils.isEmpty(env) && StringUtils.isEmpty(fileUploadPath)
							&& StringUtils.isEmpty(fileHttpRoot) && StringUtils.isEmpty(fileHttpUrl)),
					"attributes error");

			if (!StringUtils.isEmpty(env)) {
				Assert.isTrue(env.startsWith("{"), "env fomart error");
				Map envObject = JSON.parseObject(env, Map.class);
				fileUploadPath = envObject.containsKey("fileUploadPath") ? envObject.get("fileUploadPath").toString()
						: fileUploadPath;
				fileHttpRoot = envObject.containsKey("fileHttpRoot") ? envObject.get("fileHttpRoot").toString()
						: fileHttpRoot;
				fileHttpUrl = envObject.containsKey("fileHttpUrl") ? envObject.get("fileHttpUrl").toString()
						: fileHttpUrl;
			}

			if (!StringUtils.isEmpty(fileUploadPath)) {
				fileUploadService.setFileUploadPath(fileUploadPath);
			}
			if (!StringUtils.isEmpty(fileHttpRoot)) {
				fileUploadService.setFileHttpRoot(fileHttpRoot);
			}
			if (!StringUtils.isEmpty(fileHttpUrl)) {
				fileUploadService.setFileHttpUrl(fileHttpUrl);
			}
			
			mooncloudResponse.setBody(fileUploadService);
		} catch (IllegalArgumentException e) {
			mooncloudResponse.setErrorCode(MooncloudResponse.ERROR_CODE);
			mooncloudResponse.setMsg(e.toString());
		}
		LOGGER.info(JSON.toJSONString(mooncloudResponse));
		return mooncloudResponse;
	}
}

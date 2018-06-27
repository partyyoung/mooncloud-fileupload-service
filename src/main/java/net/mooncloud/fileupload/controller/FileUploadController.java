package net.mooncloud.fileupload.controller;

import java.io.BufferedReader;
import java.io.IOException;
import java.io.InputStreamReader;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.util.Assert;
import org.springframework.util.StringUtils;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.context.request.RequestContextHolder;
import org.springframework.web.context.request.ServletRequestAttributes;
import org.springframework.web.multipart.MultipartFile;

import com.alibaba.fastjson.JSON;

import net.mooncloud.fileupload.MooncloudResponse;
import net.mooncloud.fileupload.service.FileUploadService;

@RestController
@RequestMapping(value = { "/upload/oss" })
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

	/**
	 * @param file
	 * @param path
	 * @param rename
	 * @param overwrite
	 * @return
	 * @throws IOException
	 */
	@RequestMapping(value = "/upload2http1", method = RequestMethod.POST)
	public Object uploadFileToHttp(MultipartFile file,
			@RequestParam(value = "path", defaultValue = "upload") String path,
			@RequestParam(value = "rename", defaultValue = "true") boolean rename,
			@RequestParam(value = "overwrite", defaultValue = "true") boolean overwrite) throws IOException {

		MooncloudResponse mooncloudResponse = new MooncloudResponse();
		try {
			Assert.isTrue(file != null && !file.isEmpty(), "file文件为空");
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

	/**
	 * @param file
	 * @param path
	 * @param rename
	 * @param overwrite
	 * @return
	 * @throws IOException
	 */
	@RequestMapping(value = "/upload2http", method = RequestMethod.POST)
	public Object uploadFilesToHttp(List<MultipartFile> file,
			@RequestParam(value = "path", defaultValue = "upload") String path,
			@RequestParam(value = "rename", defaultValue = "true") boolean rename,
			@RequestParam(value = "overwrite", defaultValue = "true") boolean overwrite) throws IOException {

		MooncloudResponse mooncloudResponse = new MooncloudResponse();
		try {
			Assert.isTrue(file != null && !file.isEmpty(), "file文件为空");
			List<Object> r = new ArrayList<Object>(file.size());
			for (MultipartFile f : file) {
				r.add(fileUploadService.uploadFileToHttp(f, path, rename, overwrite));
			}
			mooncloudResponse.setBody(r);
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
			@RequestParam(value = "fileHttpUrl", defaultValue = "") String fileHttpUrl,
			@RequestParam(value = "fileHttpUrl2", defaultValue = "") String fileHttpUrl2) {
		MooncloudResponse mooncloudResponse = new MooncloudResponse();
		try {
			Assert.isTrue(!(StringUtils.isEmpty(env) && StringUtils.isEmpty(fileUploadPath)
					&& StringUtils.isEmpty(fileHttpRoot) && StringUtils.isEmpty(fileHttpUrl)
					&& StringUtils.isEmpty(fileHttpUrl2)), "attributes error");

			if (!StringUtils.isEmpty(env)) {
				Assert.isTrue(env.startsWith("{"), "env fomart error");
				Map envObject = JSON.parseObject(env, Map.class);
				fileUploadPath = envObject.containsKey("fileUploadPath") ? envObject.get("fileUploadPath").toString()
						: fileUploadPath;
				fileHttpRoot = envObject.containsKey("fileHttpRoot") ? envObject.get("fileHttpRoot").toString()
						: fileHttpRoot;
				fileHttpUrl = envObject.containsKey("fileHttpUrl") ? envObject.get("fileHttpUrl").toString()
						: fileHttpUrl;
				fileHttpUrl2 = envObject.containsKey("fileHttpUrl2") ? envObject.get("fileHttpUrl2").toString()
						: fileHttpUrl2;
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
			if (!StringUtils.isEmpty(fileHttpUrl2)) {
				fileUploadService.setFileHttpUrl2(fileHttpUrl2);
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

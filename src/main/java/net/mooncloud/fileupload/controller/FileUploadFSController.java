package net.mooncloud.fileupload.controller;

import java.io.IOException;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.ArrayList;
import java.util.Map;

import org.apache.shiro.authz.annotation.RequiresRoles;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.util.Assert;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import net.mooncloud.fileupload.MooncloudResponse;
import net.mooncloud.fileupload.service.FileUploadFSService;
import net.mooncloud.fileupload.service.FileUploadService;

@RestController
@RequestMapping(value = { "/upload/oss/fs" })
public class FileUploadFSController {

	private final static Logger LOGGER = LoggerFactory.getLogger(FileUploadFSController.class);

	@Autowired
	private FileUploadFSService fileUploadFSService;

	@Autowired
	private FileUploadService fileUploadService;

	@RequestMapping()
	public Object home() throws IOException {
		MooncloudResponse mooncloudResponse = new MooncloudResponse();
		mooncloudResponse.setBody("file-upload-fs-manager");
		return mooncloudResponse;
	}

	@RequestMapping(value = "/ls", method = { RequestMethod.GET, RequestMethod.POST })
	public Object ls(@RequestParam(value = "path", defaultValue = "") String path,
			@RequestParam(value = "orderby", defaultValue = "lastModifiedTime:desc;name:desc") String orderby) {
		MooncloudResponse mooncloudResponse = new MooncloudResponse();
		try {
			String absolutePath = fileUploadService.getFileHttpRoot() + "/" + path;
			Map<String, Object> r = fileUploadFSService.ls(absolutePath, orderby);
			// r.put("path", path);
			// int pid = path.lastIndexOf('/');
			// String parentPath = pid == -1 ? path : path.substring(0, pid);
			// r.put("parentPath", parentPath);
			mooncloudResponse.setBody(r);
		} catch (Exception e) {
			mooncloudResponse.setErrorCode(MooncloudResponse.ERROR_CODE);
			mooncloudResponse.setMsg(e.toString());
		}
		return mooncloudResponse;
	}

	@RequestMapping(value = "/mkdir", method = { RequestMethod.GET, RequestMethod.POST })
	public Object mkdir(@RequestParam(value = "path", defaultValue = "") String path, String name) {
		MooncloudResponse mooncloudResponse = new MooncloudResponse();
		try {
			Assert.isTrue(name != null && !name.trim().isEmpty(), "name为空");

			Map<String, Object> r = fileUploadFSService
					.mkdir(Paths.get(fileUploadService.getFileHttpRoot(), path, name));
			mooncloudResponse.setBody(r);
		} catch (Exception e) {
			mooncloudResponse.setErrorCode(MooncloudResponse.ERROR_CODE);
			mooncloudResponse.setMsg(e.toString());
		}
		return mooncloudResponse;
	}

	// @RequiresRoles("admin")
	@RequestMapping(value = "/rmr", method = { RequestMethod.GET, RequestMethod.POST })
	public Object rmr(@RequestParam(value = "path", defaultValue = "") String path, String names) {
		MooncloudResponse mooncloudResponse = new MooncloudResponse();
		try {
			Assert.isTrue(names != null && !names.isEmpty(), "names为空");

			Path absolutePath = Paths.get(fileUploadService.getFileHttpRoot(), path);
			fileUploadFSService.rmr(absolutePath.toString(), names.split(","));
			Map<String, Object> r = fileUploadFSService.ls(absolutePath);
			mooncloudResponse.setBody(r);
		} catch (Exception e) {
			mooncloudResponse.setErrorCode(MooncloudResponse.ERROR_CODE);
			mooncloudResponse.setMsg(e.toString());
		}
		return mooncloudResponse;
	}

	// @RequiresRoles("admin")
	@RequestMapping(value = "/rm", method = { RequestMethod.GET, RequestMethod.POST })
	public Object rm(@RequestParam(value = "path", defaultValue = "") String path, String name) {
		MooncloudResponse mooncloudResponse = new MooncloudResponse();
		try {
			Assert.isTrue(name != null && !name.trim().isEmpty(), "name为空");

			Path absolutePath = Paths.get(fileUploadService.getFileHttpRoot(), path, name);
			long count = fileUploadFSService.rmr(absolutePath);
			Map<String, Object> r = fileUploadFSService.ls(absolutePath.getParent());
			mooncloudResponse.setBody(r);
		} catch (Exception e) {
			mooncloudResponse.setErrorCode(MooncloudResponse.ERROR_CODE);
			mooncloudResponse.setMsg(e.toString());
		}
		return mooncloudResponse;
	}

	// @RequiresRoles("admin")
	@RequestMapping(value = "/chattra", method = { RequestMethod.GET, RequestMethod.POST })
	public Object chattra(@RequestParam(value = "path", defaultValue = "") String path, String names,
			boolean deletable) {
		MooncloudResponse mooncloudResponse = new MooncloudResponse();
		try {
			Assert.isTrue(names != null && !names.isEmpty(), "names为空");

			Path absolutePath = Paths.get(fileUploadService.getFileHttpRoot(), path);
			long count = fileUploadFSService.chattra(absolutePath.toString(), names.split(","), deletable);
			Map<String, Object> r = fileUploadFSService.ls(absolutePath);
			mooncloudResponse.setBody(r);
		} catch (Exception e) {
			mooncloudResponse.setErrorCode(MooncloudResponse.ERROR_CODE);
			mooncloudResponse.setMsg(e.toString());
		}
		return mooncloudResponse;
	}
}

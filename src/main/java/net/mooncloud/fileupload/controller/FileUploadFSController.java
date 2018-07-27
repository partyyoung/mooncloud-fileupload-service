package net.mooncloud.fileupload.controller;

import java.io.IOException;
import java.nio.file.Paths;
import java.util.Map;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
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
	FileUploadFSService fileUploadFSService;

	@Autowired
	private FileUploadService fileUploadService;

	@RequestMapping()
	public Object home() throws IOException {
		MooncloudResponse mooncloudResponse = new MooncloudResponse();
		mooncloudResponse.setBody("file-upload-manager");
		return mooncloudResponse;
	}

	/**
	 * @param username
	 * @param password
	 *            MD5
	 * @return
	 * @throws IOException
	 */
	@RequestMapping(value = "/login", method = RequestMethod.POST)
	public Object login(String username, String password) throws IOException {
		return null;
	}

	@RequestMapping(value = "/ls", method = { RequestMethod.GET, RequestMethod.POST })
	public Object ls(@RequestParam(value = "path", defaultValue = "") String path) {
		MooncloudResponse mooncloudResponse = new MooncloudResponse();
		try {
			String absolutePath = fileUploadService.getFileHttpRoot() + "/" + path;
			Map<String, Object> r = fileUploadFSService.ls(absolutePath);
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
			Map<String, Object> r = fileUploadFSService
					.mkdir(Paths.get(fileUploadService.getFileHttpRoot(), path, name));
			mooncloudResponse.setBody(r);
		} catch (Exception e) {
			mooncloudResponse.setErrorCode(MooncloudResponse.ERROR_CODE);
			mooncloudResponse.setMsg(e.toString());
		}
		return mooncloudResponse;
	}

	@RequestMapping(value = "/rmr", method = { RequestMethod.GET, RequestMethod.POST })
	public Object rmr(@RequestParam(value = "path", defaultValue = "") String path, String name) {
		MooncloudResponse mooncloudResponse = new MooncloudResponse();
		try {
			Map<String, Object> r = fileUploadFSService
					.rmr(Paths.get(fileUploadService.getFileHttpRoot(), path, name));
			mooncloudResponse.setBody(r);
		} catch (Exception e) {
			mooncloudResponse.setErrorCode(MooncloudResponse.ERROR_CODE);
			mooncloudResponse.setMsg(e.toString());
		}
		return mooncloudResponse;
	}
}

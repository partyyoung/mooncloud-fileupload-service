package net.mooncloud.fileupload.controller;

import java.io.IOException;

import org.apache.shiro.SecurityUtils;
import org.apache.shiro.authc.UnknownAccountException;
import org.apache.shiro.authc.UsernamePasswordToken;
import org.apache.shiro.authz.annotation.RequiresRoles;
import org.apache.shiro.subject.Subject;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.util.Assert;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.bind.annotation.RestController;

import net.mooncloud.fileupload.MooncloudResponse;
import net.mooncloud.fileupload.service.FileUploadUserService;

@RestController
@RequestMapping(value = { "/upload/oss/fs/user" })
public class FileUploadUserController {

	private final static Logger LOGGER = LoggerFactory.getLogger(FileUploadUserController.class);

	@Autowired
	private FileUploadUserService fileUploadUserService;

	@RequestMapping()
	public Object home() throws IOException {
		MooncloudResponse mooncloudResponse = new MooncloudResponse();
		mooncloudResponse.setBody("file-upload-user-manager");
		return mooncloudResponse;
	}

	/**
	 * @param username
	 * @param password
	 *            MD5
	 * @return
	 * @throws IOException
	 */
	@RequestMapping(value = "/login", method = { RequestMethod.GET, RequestMethod.POST })
	public Object login(String username, String password) throws IOException {
		MooncloudResponse mooncloudResponse = new MooncloudResponse();
		try {
			Assert.isTrue(
					username != null && !username.trim().isEmpty() && password != null && !password.trim().isEmpty(),
					"用户名或密码均不能为空！");

			if (fileUploadUserService.getUsersCount() == 0) {
				fileUploadUserService.newUser(username, password, "admin");
			}

			UsernamePasswordToken token = new UsernamePasswordToken(username, password);
			Subject subject = SecurityUtils.getSubject();
			subject.login(token);
			subject.getSession().setTimeout(-1000);
		} catch (Exception e) {
			mooncloudResponse.setErrorCode(MooncloudResponse.ERROR_CODE);
			mooncloudResponse.setMsg(e.toString());
		}
		return mooncloudResponse;
	}

	@RequiresRoles("admin")
	@RequestMapping(value = "/add", method = { RequestMethod.GET, RequestMethod.POST })
	public Object add(String username, String password) throws IOException {
		MooncloudResponse mooncloudResponse = new MooncloudResponse();
		try {
			Assert.isTrue(
					username != null && !username.trim().isEmpty() && password != null && !password.trim().isEmpty(),
					"用户名或密码均不能为空！");

			if (fileUploadUserService.getUsersCount() == 0) {
				fileUploadUserService.newUser(username, password, "admin");
			}

			Assert.isTrue(fileUploadUserService.getPassword(username) == null, "用户名已存在！");

			fileUploadUserService.newUser(username, password, "user");
		} catch (Exception e) {
			mooncloudResponse.setErrorCode(MooncloudResponse.ERROR_CODE);
			mooncloudResponse.setMsg(e.toString());
		}
		return mooncloudResponse;
	}

	@RequestMapping(value = "/newpwd", method = { RequestMethod.GET, RequestMethod.POST })
	public Object newPWD(String username, String oldpwd, String newpwd) throws IOException {
		MooncloudResponse mooncloudResponse = new MooncloudResponse();
		try {
			Assert.isTrue(username != null && !username.trim().isEmpty() && oldpwd != null && !oldpwd.trim().isEmpty()
					&& newpwd != null && !newpwd.trim().isEmpty(), "用户名或密码均不能为空！");

			Assert.isTrue(fileUploadUserService.getUsersCount() > 0, "");

			Assert.isTrue(oldpwd.equals(fileUploadUserService.getPassword(username)), "原密码不正确！");

			fileUploadUserService.newPWD(username, newpwd);
		} catch (Exception e) {
			mooncloudResponse.setErrorCode(MooncloudResponse.ERROR_CODE);
			mooncloudResponse.setMsg(e.toString());
		}
		return mooncloudResponse;
	}

	@RequiresRoles("admin")
	@RequestMapping(value = "/resetpwd", method = { RequestMethod.GET, RequestMethod.POST })
	public Object resetPWD(String username, String newpwd) throws IOException {
		MooncloudResponse mooncloudResponse = new MooncloudResponse();
		try {
			Assert.isTrue(username != null && !username.trim().isEmpty() && newpwd != null && !newpwd.trim().isEmpty(),
					"用户名或密码均不能为空！");

			Assert.isTrue(fileUploadUserService.getUsersCount() > 0, "");

			fileUploadUserService.newPWD(username, newpwd);
		} catch (Exception e) {
			mooncloudResponse.setErrorCode(MooncloudResponse.ERROR_CODE);
			mooncloudResponse.setMsg(e.toString());
		}
		return mooncloudResponse;
	}

	@RequestMapping(value = "/get", method = { RequestMethod.GET, RequestMethod.POST })
	public Object get() throws IOException {
		MooncloudResponse mooncloudResponse = new MooncloudResponse();
		try {
			Subject subject = SecurityUtils.getSubject();
			Object o = subject.getPrincipal();
			if (o == null)
				throw new UnknownAccountException();
			String username = null;
			if (o instanceof String) {
				username = (String) o;
			} else {
				throw new UnknownAccountException();
			}
			mooncloudResponse.setBody(fileUploadUserService.getUser(username));
		} catch (Exception e) {
			mooncloudResponse.setErrorCode(MooncloudResponse.ERROR_CODE);
			mooncloudResponse.setMsg(e.toString());
		}
		return mooncloudResponse;
	}

	@RequiresRoles("admin")
	@RequestMapping(value = "/all", method = { RequestMethod.GET, RequestMethod.POST })
	public Object all() throws IOException {
		MooncloudResponse mooncloudResponse = new MooncloudResponse();
		try {
			mooncloudResponse.setBody(fileUploadUserService.USERS);
		} catch (Exception e) {
			mooncloudResponse.setErrorCode(MooncloudResponse.ERROR_CODE);
			mooncloudResponse.setMsg(e.toString());
		}
		return mooncloudResponse;
	}

	@RequestMapping(value = "/logout", method = { RequestMethod.GET, RequestMethod.POST })
	public Object logout() throws IOException {
		MooncloudResponse mooncloudResponse = new MooncloudResponse();
		try {
			Subject subject = SecurityUtils.getSubject();
			subject.logout();
		} catch (Exception e) {
			mooncloudResponse.setErrorCode(MooncloudResponse.ERROR_CODE);
			mooncloudResponse.setMsg(e.toString());
		}
		return mooncloudResponse;
	}
}

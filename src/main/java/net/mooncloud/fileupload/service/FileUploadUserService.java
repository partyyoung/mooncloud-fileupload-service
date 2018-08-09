package net.mooncloud.fileupload.service;

import java.io.File;
import java.io.FileReader;
import java.io.FileWriter;
import java.io.Reader;
import java.io.Writer;
import java.util.LinkedHashSet;
import java.util.Map;
import java.util.Set;
import java.util.concurrent.ConcurrentHashMap;

import javax.annotation.PostConstruct;

import org.springframework.stereotype.Service;

import com.alibaba.fastjson.JSON;

@Service
public class FileUploadUserService {

	private static String USER_FILE = "user.txt";

	public static Users USERS = new Users();

	@PostConstruct
	private void initService() throws Exception {
		loadUser();
	}

	public int getUsersCount() {
		return USERS.users.size();
	}

	public void newUser(String username, String password, String role) {
		User user;
		if (USERS.users.containsKey(username)) {
			user = USERS.users.get(username);
		} else {
			user = new User();
			USERS.users.put(username, user);
		}
		user.setUsername(username);
		user.setPassword(password);

		Set<String> roles = user.getRoles();
		roles.add(role);
		saveUser();
	}

	public void newPWD(String username, String password) {
		USERS.users.get(username).setPassword(password);
		saveUser();
	}

	public void newRole(String username, String role) {
		USERS.users.get(username).getRoles().add(role);
		saveUser();
	}

	public String getPassword(String username) {
		return USERS.users.containsKey(username) ? USERS.users.get(username).getPassword() : null;
	}

	public Set<String> getRoles(String username) {
		return USERS.users.containsKey(username) ? USERS.users.get(username).getRoles() : null;
	}

	public User getUser(String username) {
		return USERS.users.get(username);
	}

	public Object grantAdmin(String username, Boolean admin) {
		User user;
		if (USERS.users.containsKey(username)) {
			user = USERS.users.get(username);
		} else {
			return null;
		}
		if (admin) {
			USERS.users.get(username).getRoles().add("admin");
		} else {
			USERS.users.get(username).getRoles().remove("admin");
		}
		saveUser();
		return user;
	}

	public Object delete(String username) {
		return USERS.users.remove(username);
	}

	private void loadUser() {
		// 1：利用File类找到要操作的对象
		File file = new File(USER_FILE);
		// if (!file.getParentFile().exists()) {
		// file.getParentFile().mkdirs();
		// }
		// 2：准备输出流
		try (Reader in = new FileReader(file)) {
			int size = 1024;
			StringBuilder sb = new StringBuilder();
			char[] cbuf = new char[size];
			while ((size = in.read(cbuf)) != -1) {
				sb.append(cbuf);
			}
			USERS = JSON.parseObject(sb.toString(), USERS.getClass());
		} catch (Exception e) {
			e.printStackTrace();
		}
	}

	private void saveUser() {
		// 1：利用File类找到要操作的对象
		File file = new File(USER_FILE);
		// if (!file.getParentFile().exists()) {
		// file.getParentFile().mkdirs();
		// }
		// 2：准备输出流
		try (Writer out = new FileWriter(file)) {
			out.write(JSON.toJSONString(USERS));
		} catch (Exception e) {
		}
	}

}

class Users {
	Map<String, User> users = new ConcurrentHashMap<String, User>();

	public Map<String, User> getUsers() {
		return users;
	}

	public void setUsers(Map<String, User> users) {
		this.users = users;
	}
}

class User {
	private String username;
	private String password;
	private Set<String> roles = new LinkedHashSet<String>(1);

	public String getUsername() {
		return username;
	}

	public void setUsername(String username) {
		this.username = username;
	}

	public String getPassword() {
		return password;
	}

	public void setPassword(String password) {
		this.password = password;
	}

	public Set<String> getRoles() {
		return roles;
	}

	public void setRoles(Set<String> roles) {
		this.roles = roles;
	}
}

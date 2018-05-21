package net.mooncloud.fileupload;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

@SpringBootApplication
public class MooncloudFileuploadServiceApplication {

	private final static Logger LOGGER = LoggerFactory.getLogger(MooncloudFileuploadServiceApplication.class);

	public static void main(String[] args) {
		SpringApplication.run(MooncloudFileuploadServiceApplication.class, args);
	}
}

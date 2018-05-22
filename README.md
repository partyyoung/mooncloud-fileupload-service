# mooncloud-fileupload-service
mooncloud-fileupload-service

mooncloud-fileupload-sdk (java&python) https://github.com/partyyoung/mooncloud-fileupload-java-sdk

## Startup
```
java -jar mooncloud-fileupload-service-0.0.1-SNAPSHOT.jar --server.port=2121 [--file-upload-service.file-upload-path=/tmp/ --spring.servlet.multipart.max-file-size=30Mb --spring.servlet.multipart.max-request-size=30Mb] > log 2>&1 &
```

## API
### /file/upload 
#### 业务参数
* file

###E 返回参数
* success true/false
* errorCode 结果状态码
* msg 
* body 

###E 返回示例
```
{
	"errorCode": null,
	"msg": null,
	"body": {
		"file": "/home/ftpuser/static/img/MultipartFileUpload.java",
		"taken": 1,
		"start": 1526983060278,
		"end": 1526983060279,
		"contentType": "application/octet-stream",
		"originalFilename": "MultipartFileUpload.java"
	},
	"success": true
}
```

### /file/upload2path
#### 业务参数
* file
* path

#### 返回参数
* success true/false
* errorCode 结果状态码
* msg 
* body 

#### 返回示例
```
{
	"errorCode": null,
	"msg": null,
	"body": {
		"file": "/home/ftpuser/static/img/MultipartFileUpload.java",
		"taken": 1,
		"start": 1526983060278,
		"end": 1526983060279,
		"contentType": "application/octet-stream",
		"originalFilename": "MultipartFileUpload.java",
		"url": "http://172.16.1.78/static/img/MultipartFileUpload.java"
	},
	"success": true
}
```

### /file/upload2http
#### 业务参数
* file
* path

### 返回参数
* success true/false
* errorCode 结果状态码
* msg 
* body 

### 返回示例
```
{
	"errorCode": null,
	"msg": null,
	"body": {
		"file": "/home/ftpuser/static/img/MultipartFileUpload.java",
		"taken": 1,
		"start": 1526983060278,
		"end": 1526983060279,
		"contentType": "application/octet-stream",
		"originalFilename": "MultipartFileUpload.java",
		"url": "http://172.16.1.78/static/img/MultipartFileUpload.java"
	},
	"success": true
}
```

## 
### 设置文件上传大小限制
Spring boot版本升级到了2.0.0，发现原来的文件上传大小限制设置不起作用了，原来的application.properties设置如下：

```
spring.http.multipart.max-file-size=30Mb   
spring.http.multipart.max-request-size=30Mb   
```
需要改成如下：

```
spring.servlet.multipart.max-file-size=30Mb   
spring.servlet.multipart.max-request-size=30Mb   
```
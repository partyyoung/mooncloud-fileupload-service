# mooncloud-fileupload-service
mooncloud-fileupload-service  

利用[MultipartFile](https://docs.spring.io/spring/docs/current/javadoc-api/org/springframework/mock/web/MockMultipartFile.html)实现文件上传  

mooncloud-fileupload-sdk (java&python) https://github.com/partyyoung/mooncloud-fileupload-sdk

## Startup
```
java -jar mooncloud-fileupload-service-0.0.1-SNAPSHOT.jar --server.port=2121 [--file-upload-service.file-upload-path=/tmp/ --spring.servlet.multipart.max-file-size=30Mb --spring.servlet.multipart.max-request-size=30Mb] > log 2>&1 &
```

### 自定义参数
\# 默认的文件上传path
```
file-upload-service.file-upload-path=/tmp
```
\# 文件服务器的root地址和http地址
```
file-upload-service.file-http-root=/home/ftpuser
file-upload-service.file-http-url=http://172.16.1.78
```

### Spring参数
\# MULTIPART (MultipartProperties)   
```
spring.servlet.multipart.max-file-size=-1   
spring.servlet.multipart.max-request-size=-1   
```

## API
### /file/upload   
文件上传到默认path下。以service启动时指定的file-upload-service.file-upload-path为准

#### 业务参数
* file

#### 返回参数
* success true/false
* errorCode  错误码
* msg 提示信息
* body 结果信息

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
		"originalFilename": "MultipartFileUpload.java"
	},
	"success": true
}
```

### /file/upload2path   
文件上传到指定的path下。

#### 业务参数
* file
* path 服务器存储路径，不能为空。

#### 返回参数
* success true/false
* errorCode  错误码
* msg 提示信息
* body 结果信息

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
文件上传到文件服务器的root/path下。path为用户指定的路径。返回文件的http地址。

#### 业务参数
* file
* path 服务器存储路径

### 返回参数
* success true/false
* errorCode  错误码
* msg 提示信息
* body 结果信息

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

## 服务调优
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

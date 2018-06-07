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

## APIs
服务地址：http://10.10.10.124:2121

1. GET /file OR /oss 可以作为服务状态接口
2. POST /file/upload 文件上传到默认path下。
3. POST /file/upload2path 文件上传到指定的path下。
4. POST /file/upload2http 文件上传到文件服务器的http-root/path下。
5. GET /file/env 获取Service环境变量值：fileUploadPath、fileHttpRoot和fileHttpUrl。
6. POST /file/env/update 更新Service环境变量值。

### 1. GET /file
可以作为服务状态接口

#### 业务参数
无

#### 返回参数
* success: true

#### 返回示例
```
{
	"errorCode": null,
	"msg": null,
	"body": "file",
	"success": true
}
```

### 2. POST /file/upload   
文件上传到默认path下。以service启动时指定的file-upload-service.file-upload-path为准

#### 业务参数
* file

#### 返回参数
* success: true/false
* errorCode: 错误码
* msg: 错误信息
* body: 结果信息   
    - file: 文件服务器上的文件绝对路径   
    - taken: 存储文件消耗的毫秒数   
    - start: 存储文件的开始时间戳   
    - end: 存储文件的结束时间戳   
    - contentType: contentType   
    - originalFilename: 原始文件名   

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

### 3. POST /file/upload2path   
文件上传到指定的path下。

#### 业务参数
* file
* path 服务器存储路径，不能为空。例如：/home/ftpuser/static/img

#### 返回参数
* success: true/false
* errorCode: 错误码
* msg: 错误信息
* body: 结果信息   
    - file: 文件服务器上的文件绝对路径   
    - taken: 存储文件消耗的毫秒数   
    - start: 存储文件的开始时间戳   
    - end: 存储文件的结束时间戳   
    - contentType: contentType   
    - originalFilename: 原始文件名   

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

### 4. POST /file/upload2http
文件上传到文件服务器的http-root/path下。http-root=$file-upload-service.file-http-root，path为用户指定的路径参数。返回文件的http地址。

#### 业务参数
* file: 
* path: http-root下的存储路径。例如：/static/img
* rename: 是否重新命名，可选参数，默认true。当前时间戳+文件名16位MD5+后缀名，作为新的文件名
* overwrite: 是否覆盖服务器文件，可选参数，默认true。如果path下有相同名字的文件，将覆盖

### 返回参数
* success: true/false
* errorCode: 错误码
* msg: 错误信息
* body: 结果信息   
    - file: 服务器上文件存储的绝对路径   
    - taken: 存储文件消耗的毫秒数   
    - start: 存储文件的开始时间戳   
    - end: 存储文件的结束时间戳   
    - contentType: contentType   
    - originalFilename: 原始文件名   
    - url: 文件的http地址   

### 返回示例
```
{
	"errorCode": null,
	"msg": null,
	"body": {
		"file": "/home/ftpuser/static/img/1527081063540-b5cc79f8e97f56ad.java",
		"taken": 1,
		"start": 1526983060278,
		"end": 1526983060279,
		"contentType": "application/octet-stream",
		"originalFilename": "MultipartFileUpload.java",
		"url": "http://127.0.0.1/static/img/1527081063540-b5cc79f8e97f56ad.java"
	},
	"success": true
}
```

### 5. GET /file/env
获取Service环境变量值：fileUploadPath、fileHttpRoot和fileHttpUrl。

#### 业务参数
无

### 返回参数
* success: true/false
* errorCode: 错误码
* msg: 错误信息
* body: 结果信息   
    - fileUploadPath: 服务器上文件存储的路径   
    - fileHttpRoot: 服务器上文件存储的路径   
    - fileHttpUrl: 文件HTTP路径前缀   

### 返回示例
```
{
	"errorCode": null,
	"msg": null,
	"body": {
		"fileUploadPath": "/tmp",
		"fileHttpRoot": "/home/ftpuser/static",
		"fileHttpUrl": "http://172.16.1.78/static"
	},
	"success": true
}
```

### 6. POST/GET /file/env/update
更新Service环境变量值。

#### 业务参数
* env: JSON字符串，包括fileUploadPath、fileHttpRoot和fileHttpUrl。{"fileUploadPath":"","fileHttpRoot":"","fileHttpUrl":""}。或者用以下参数单独更新某个环境变量的值。   
* fileUploadPath: upload服务器上文件存储的路径   
* fileHttpRoot: file2http服务器上文件存储的路径   
* fileHttpUrl: file2http文件HTTP路径前缀   

### 返回参数
* success: true/false
* errorCode: 错误码
* msg: 错误信息
* body: 结果信息   
    - fileUploadPath: 服务器上文件存储的路径   
    - fileHttpRoot: 服务器上文件存储的路径   
    - fileHttpUrl: 文件HTTP路径前缀   

### 返回示例
```
{
	"errorCode": null,
	"msg": null,
	"body": {
		"fileUploadPath": "/tmp",
		"fileHttpRoot": "/home/ftpuser/static",
		"fileHttpUrl": "http://172.16.1.78/static"
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

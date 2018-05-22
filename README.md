# mooncloud-fileupload-service
mooncloud-fileupload-service

## Startup
```
java -jar mooncloud-fileupload-service-0.0.1-SNAPSHOT.jar --server.port=2121 [--file-upload-service.file-upload-path=/tmp/ --spring.servlet.multipart.max-file-size=30Mb --spring.servlet.multipart.max-request-size=30Mb] > log 2>&1 &
```

## 设置文件上传大小限制
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
package net.mooncloud.fileupload;

public class MooncloudResponse {

	public static final String ERROR_CODE = "50";

	private String code;

	private Boolean message;

	private String errorCode;

	private String msg;

	private Object body;

	public String getErrorCode() {
		return errorCode;
	}

	public void setErrorCode(String errorCode) {
		this.errorCode = errorCode;
	}

	public String getMsg() {
		return msg;
	}

	public void setMsg(String msg) {
		this.msg = msg;
	}

	public Object getBody() {
		return body;
	}

	public void setBody(Object body) {
		this.body = body;
	}

	public boolean isSuccess() {
		return this.errorCode == null;
	}

	public boolean getMessage() {
		return this.errorCode == null;
	}

	public String getCode() {
		return this.errorCode == null ? "00000" : "99999";
	}
}

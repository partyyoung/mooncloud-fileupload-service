package net.mooncloud.fileupload.aop;

import java.lang.reflect.Method;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

import javax.servlet.http.HttpServletResponse;

import org.aspectj.lang.ProceedingJoinPoint;
import org.aspectj.lang.annotation.Around;
import org.aspectj.lang.annotation.Aspect;
import org.aspectj.lang.annotation.Pointcut;
import org.aspectj.lang.reflect.MethodSignature;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Component;
import org.springframework.web.context.request.RequestAttributes;
import org.springframework.web.context.request.RequestContextHolder;
import org.springframework.web.context.request.ServletRequestAttributes;

import com.alibaba.fastjson.JSON;

import net.mooncloud.fileupload.MooncloudResponse;

/**
 * 拦截器：记录用户操作日志，监控用户请求性能
 * 
 * @author yangjd
 *
 */
@Aspect
@Component
public class ControllerInterceptor {

	private static final Logger LOGGER = LoggerFactory.getLogger(ControllerInterceptor.class);

	private static final Map<String, Long> METHOD_TIME = new ConcurrentHashMap<String, Long>(16);
	private static final long METHOD_TIME_INTERVAL = 100L; // 接口请求的最小时间间隔(ms)

	/**
	 * 定义拦截规则：拦截net.mooncloud.hyperchain.controller包下面的所有类中，有@RequestMapping注解的方法。
	 */
	@Pointcut("execution(* net.mooncloud.fileupload.controller..*(..)) and @annotation(import org.springframework.web.bind.annotation.GetMapping)")
	public void controllerMethodPointcut() {
	}

	/**
	 * 拦截器具体实现
	 * 
	 * @param pjp
	 * @return JsonResult（被拦截方法的执行结果，或需要登录的错误提示。
	 * @throws Throwable
	 */
	@Around("controllerMethodPointcut()") // 指定拦截器规则；也可以直接把“execution(* //
											// net.mooncloud.hyperchain.controller..........)”写进这里
	public Object Interceptor(ProceedingJoinPoint pjp) throws Throwable {
		RequestAttributes ra = RequestContextHolder.getRequestAttributes();
		ServletRequestAttributes sra = (ServletRequestAttributes) ra;
		HttpServletResponse response = sra.getResponse();

		response.addHeader("Access-Control-Allow-Origin", "*");

		MethodSignature signature = (MethodSignature) pjp.getSignature();
		// 获取被拦截的方法
		Method method = signature.getMethod();
		// 获取被拦截的方法名
		String methodName = method.getDeclaringClass().getName() + "." + method.getName();
		// SimpleDateFormat sdf = new SimpleDateFormat("yyyy-MM-dd HH:mm:ss:SSS");

		MooncloudResponse mooncloudResponse = new MooncloudResponse();

		long beginTime = System.currentTimeMillis();

		if (METHOD_TIME.containsKey(methodName)) {
			if (beginTime - METHOD_TIME.get(methodName) < METHOD_TIME_INTERVAL) {
				mooncloudResponse.setErrorCode(MooncloudResponse.ERROR_CODE);
				mooncloudResponse.setMsg("接口请求过于频繁");
				LOGGER.info("method: {}, start: {}, msg: {}", methodName, beginTime,
						JSON.toJSONString(mooncloudResponse));
				return mooncloudResponse;
			}
		}
		METHOD_TIME.put(methodName, beginTime);

		// 执行被拦截的方法
		LOGGER.info("method: {}, start: {}", methodName, beginTime);
		try {
			mooncloudResponse = (MooncloudResponse) pjp.proceed();
		} catch (Exception e) {
			mooncloudResponse.setErrorCode(MooncloudResponse.ERROR_CODE);
			mooncloudResponse.setMsg(e.toString());
		}
		long endTime = System.currentTimeMillis();
		LOGGER.info("method: {}, start: {}, end: {}, taken: {}", methodName, beginTime, endTime, endTime - beginTime);

		// LOGGER.info("请求方法: {}, 返回结果: {}", methodName, JSON.toJSONString(result));

		return mooncloudResponse;
	}
}

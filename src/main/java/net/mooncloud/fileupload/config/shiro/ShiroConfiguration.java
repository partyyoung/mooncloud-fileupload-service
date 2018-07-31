package net.mooncloud.fileupload.config.shiro;

import java.util.LinkedHashMap;

import org.apache.shiro.mgt.SecurityManager;
import org.apache.shiro.realm.Realm;
import org.apache.shiro.spring.LifecycleBeanPostProcessor;
import org.apache.shiro.spring.security.interceptor.AuthorizationAttributeSourceAdvisor;
import org.apache.shiro.spring.web.ShiroFilterFactoryBean;
import org.apache.shiro.web.mgt.DefaultWebSecurityManager;
import org.springframework.aop.framework.autoproxy.DefaultAdvisorAutoProxyCreator;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import net.mooncloud.fileupload.service.FileUploadFSService;

@Configuration
public class ShiroConfiguration {

	@Bean(name = "shiroFilter")
	public ShiroFilterFactoryBean shiroFilter(@Qualifier("securityManager") SecurityManager manager) {
		ShiroFilterFactoryBean bean = new ShiroFilterFactoryBean();
		bean.setSecurityManager(manager);

		// 配置登录的url和登录成功的url
		bean.setLoginUrl("/upload/oss/fs/user/get");
		bean.setSuccessUrl("/upload/oss/fs/user/get");
		bean.setUnauthorizedUrl("/upload/oss/fs/user/get");

		// 配置访问权限
		LinkedHashMap<String, String> filterChainDefinitionMap = new LinkedHashMap<>();
//		filterChainDefinitionMap.put("/upload/oss/fs/user/login", "anon"); // 表示可以匿名访问
//		filterChainDefinitionMap.put("/upload/oss/fs/user/get", "anon"); // 表示可以匿名访问
//		filterChainDefinitionMap.put("/static/**", "anon");
//		filterChainDefinitionMap.put("/upload/oss/fs/*", "authc");// 表示需要认证才可以访问
//		filterChainDefinitionMap.put("/upload/oss/fs/**", "authc");// 表示需要认证才可以访问
		// filterChainDefinitionMap.put("/*", "authc");// 表示需要认证才可以访问
		// filterChainDefinitionMap.put("/**", "authc");// 表示需要认证才可以访问
		// filterChainDefinitionMap.put("/*.*", "authc");
		 filterChainDefinitionMap.put("/*", "anon"); // 表示可以匿名访问
		 filterChainDefinitionMap.put("/**", "anon"); // 表示可以匿名访问
		 filterChainDefinitionMap.put("/*.*", "anon"); // 表示可以匿名访问
		bean.setFilterChainDefinitionMap(filterChainDefinitionMap);
		return bean;
	}

	// @Bean(name = "shiroFilter")
	// @ConfigurationProperties(prefix = "shiro.shiro-filter")
	public ShiroFilterFactoryBean shiroFilterFactoryBean(@Qualifier("securityManager") SecurityManager manager) {
		ShiroFilterFactoryBean bean = new ShiroFilterFactoryBean();
		bean.setSecurityManager(manager);
		return bean;
	}

	// 配置核心安全事务管理器
	@Bean(name = "securityManager")
	public SecurityManager securityManager(@Qualifier("authRealm") Realm authRealm) {
		System.err.println("--------------shiro已经加载----------------");
		DefaultWebSecurityManager manager = new DefaultWebSecurityManager();
		manager.setRealm(authRealm);
		return manager;
	}

	@Autowired
	private UserRealm authRealm;
	// // 配置自定义的权限登录器
	// @Bean(name = "authRealm")
	// public Realm authRealm() {
	// Realm authRealm = new UserRealm();
	// return authRealm;
	// }

	@Bean
	public LifecycleBeanPostProcessor lifecycleBeanPostProcessor() {
		return new LifecycleBeanPostProcessor();
	}

	@Bean
	public DefaultAdvisorAutoProxyCreator defaultAdvisorAutoProxyCreator() {
		DefaultAdvisorAutoProxyCreator creator = new DefaultAdvisorAutoProxyCreator();
		creator.setProxyTargetClass(true);
		return creator;
	}

	@Bean
	public AuthorizationAttributeSourceAdvisor authorizationAttributeSourceAdvisor(
			@Qualifier("securityManager") SecurityManager securityManager) {
		AuthorizationAttributeSourceAdvisor advisor = new AuthorizationAttributeSourceAdvisor();
		advisor.setSecurityManager(securityManager);
		return advisor;
	}
}

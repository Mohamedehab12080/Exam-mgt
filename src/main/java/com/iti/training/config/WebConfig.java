package com.iti.training.config;

import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.ResourceHandlerRegistry;
import org.springframework.web.servlet.config.annotation.ViewControllerRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

/**
 * Web Configuration Class
 * Configures static resource handling and view controllers for the frontend
 */
@Configuration
public class WebConfig implements WebMvcConfigurer {

    /**
     * Configure static resource handlers
     * Maps URL paths to resource locations for CSS, JS, and other static assets
     */
    @Override
    public void addResourceHandlers(ResourceHandlerRegistry registry) {
        // Map /assets/** to the static assets directory
        registry.addResourceHandler("/assets/**")
                .addResourceLocations("classpath:/static/assets/")
                .setCachePeriod(3600) // Cache for 1 hour in production
                .resourceChain(true);
        
        // Map /favicon.ico to the static root
        registry.addResourceHandler("/favicon.ico")
                .addResourceLocations("classpath:/static/favicon.ico")
                .setCachePeriod(86400); // Cache for 24 hours
    }

    /**
     * Configure view controllers for SPA routing
     * Maps frontend routes to the main template
     */
    @Override
    public void addViewControllers(ViewControllerRegistry registry) {
        // Map frontend routes to the main template
        String[] frontendRoutes = {
            "/dashboard",
            "/students", 
            "/students/**",
            "/courses",
            "/courses/**",
            "/exams",
            "/exams/**",
            "/questions",
            "/questions/**",
            "/attempts",
            "/attempts/**",
            "/choices",
            "/choices/**"
        };
        
        for (String route : frontendRoutes) {
            registry.addViewController(route).setViewName("forward:/");
        }
    }
}
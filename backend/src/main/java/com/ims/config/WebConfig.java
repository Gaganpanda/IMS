package com.ims.config;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.ResourceHandlerRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

@Configuration
public class WebConfig implements WebMvcConfigurer {

    // Was hardcoded to "uploads/", ignoring UPLOAD_DIR / app.upload.dir.
    // That happened to still work in Docker only because the relative path
    // coincidentally resolved under the container's /app working directory —
    // but it silently diverged from configuration, so any future change to
    // UPLOAD_DIR would serve images from the wrong place.
    @Value("${app.upload.dir:uploads/}")
    private String uploadDir;

    @Override
    public void addResourceHandlers(ResourceHandlerRegistry registry) {

        String location = uploadDir.endsWith("/") ? uploadDir : uploadDir + "/";
        registry.addResourceHandler("/uploads/**")
                .addResourceLocations("file:" + location);
    }
}
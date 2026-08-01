package com.mymoney.config;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.ResourceHandlerRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

import java.io.File;

@Configuration
public class WebConfig implements WebMvcConfigurer {

    @Value("${mymoney.upload.dir}")
    private String uploadDir;

    @Override
    public void addResourceHandlers(ResourceHandlerRegistry registry) {
        // Expose local file directory through static file mapping
        File file = new File(uploadDir);
        String absPath = file.getAbsolutePath();
        
        // Ensure path ends with slash for resource mapping
        if (!absPath.endsWith(File.separator)) {
            absPath += File.separator;
        }
        
        registry.addResourceHandler("/uploads/**")
                .addResourceLocations("file:" + absPath);
    }
}

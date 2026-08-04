package com.mymoney.config;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Primary;
import org.springframework.boot.jdbc.DataSourceBuilder;
import javax.sql.DataSource;
import java.net.URI;

@Configuration
public class DatabaseConfig {

    @Value("${spring.datasource.url}")
    private String defaultUrl;

    @Value("${spring.datasource.username}")
    private String defaultUsername;

    @Value("${spring.datasource.password}")
    private String defaultPassword;

    @Value("${spring.datasource.driverClassName}")
    private String defaultDriver;

    @Bean
    @Primary
    public DataSource dataSource() {
        String databaseUrl = System.getenv("DATABASE_URL");
        if (databaseUrl == null || databaseUrl.isEmpty()) {
            databaseUrl = System.getenv("SPRING_DATASOURCE_URL");
        }

        if (databaseUrl != null && !databaseUrl.isEmpty()) {
            if (databaseUrl.startsWith("postgres://") || databaseUrl.startsWith("postgresql://")) {
                try {
                    // Extract info from URI format
                    String formattedUrl = databaseUrl;
                    if (formattedUrl.startsWith("postgresql://")) {
                        formattedUrl = "postgres://" + formattedUrl.substring(13);
                    }
                    URI uri = new URI(formattedUrl);
                    String userInfo = uri.getUserInfo();
                    String username = userInfo.split(":")[0];
                    String password = userInfo.split(":")[1];
                    String host = uri.getHost();
                    int port = uri.getPort();
                    if (port == -1) {
                        port = 5432;
                    }
                    String dbUrl = "jdbc:postgresql://" + host + ":" + port + uri.getPath();
                    
                    // Enforce SSL Mode for cloud databases
                    if (!"localhost".equals(host) && !"127.0.0.1".equals(host)) {
                        if (dbUrl.contains("?")) {
                            dbUrl += "&sslmode=require";
                        } else {
                            dbUrl += "?sslmode=require";
                        }
                    }

                    return DataSourceBuilder.create()
                            .url(dbUrl)
                            .username(username)
                            .password(password)
                            .driverClassName("org.postgresql.Driver")
                            .build();
                } catch (Exception e) {
                    // Fall back to direct parsing or default config if URI parsing fails
                }
            } else if (databaseUrl.startsWith("jdbc:postgresql://")) {
                String dbUrl = databaseUrl;
                // Enforce SSL Mode for cloud databases if not localhost
                if (!dbUrl.contains("localhost") && !dbUrl.contains("127.0.0.1") && !dbUrl.contains("sslmode=")) {
                    if (dbUrl.contains("?")) {
                        dbUrl += "&sslmode=require";
                    } else {
                        dbUrl += "?sslmode=require";
                    }
                }
                
                String username = System.getenv("SPRING_DATASOURCE_USERNAME");
                String password = System.getenv("SPRING_DATASOURCE_PASSWORD");
                if (username == null) username = defaultUsername;
                if (password == null) password = defaultPassword;

                return DataSourceBuilder.create()
                        .url(dbUrl)
                        .username(username)
                        .password(password)
                        .driverClassName("org.postgresql.Driver")
                        .build();
            }
        }

        // Default local config fallback
        String dbUrl = defaultUrl;
        if (!dbUrl.contains("localhost") && !dbUrl.contains("127.0.0.1") && !dbUrl.contains("sslmode=")) {
            if (dbUrl.contains("?")) {
                dbUrl += "&sslmode=require";
            } else {
                dbUrl += "?sslmode=require";
            }
        }

        return DataSourceBuilder.create()
                .url(dbUrl)
                .username(defaultUsername)
                .password(defaultPassword)
                .driverClassName(defaultDriver)
                .build();
    }
}

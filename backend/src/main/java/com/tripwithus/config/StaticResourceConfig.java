package com.tripwithus.config;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.ResourceHandlerRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;

/**
 * Registers a single catch-all resource handler so that Spring Boot serves the
 * static frontend (HTML/CSS/JS) directly from the {@code frontend/} folder.
 *
 * This replaces the old Python dev-server / nginx setup: the same Spring Boot
 * app now serves both the SPA and the /api backend on a single origin.
 *
 * Spring MVC @Controller mappings take priority over resource handlers, so the
 * /api/** endpoints and the SPA forward controller still work as expected.
 */
@Configuration
public class StaticResourceConfig implements WebMvcConfigurer {

    /** Path (relative to the project root) where the frontend static files live. */
    private static final String FRONTEND_RELATIVE = "frontend";

    @Value("${app.static.frontend-dir:}")
    private String frontendDirOverride;

    @Override
    public void addResourceHandlers(ResourceHandlerRegistry registry) {
        // Allow an explicit override via app.static.frontend-dir (e.g. in Docker).
        String frontendDir = frontendDirOverride != null && !frontendDirOverride.isBlank()
                ? frontendDirOverride
                : resolveProjectFrontendDir();

        // Ensure the path ends with a trailing slash for resource resolution.
        if (!frontendDir.endsWith("/") && !frontendDir.endsWith("\\")) {
            frontendDir += "/";
        }

        String fileLocation = "file:" + frontendDir;

        // Single catch-all handler: /css/style.css -> <frontend>/css/style.css,
        // /index.html -> <frontend>/index.html, etc.
        registry.addResourceHandler("/**")
                .addResourceLocations(fileLocation);
    }

    /**
     * Resolve the frontend directory relative to the current working directory.
     * Falls back to the classpath /resources/static if the folder is missing.
     */
    private String resolveProjectFrontendDir() {
        Path path = Paths.get(FRONTEND_RELATIVE).toAbsolutePath();
        if (Files.isDirectory(path)) {
            return path.toString();
        }
        // Fallback: look relative to the backend module (../frontend).
        Path parent = Paths.get("..", FRONTEND_RELATIVE).toAbsolutePath();
        if (Files.isDirectory(parent)) {
            return parent.toString();
        }
        // Last resort: classpath static resources.
        return "classpath:/static/";
    }
}

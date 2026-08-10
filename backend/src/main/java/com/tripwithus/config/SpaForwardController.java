package com.tripwithus.config;

import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;

/**
 * SPA fallback controller.
 *
 * Replicates the nginx {@code try_files $uri $uri/ /index.html;} behaviour so
 * that any client-side route (e.g. /home, /bus) that isn't an API endpoint or
 * a real static file returns the index page instead of a 404.
 */
@Controller
public class SpaForwardController {

    @GetMapping(value = {"/", "/home", "/bus", "/car", "/train", "/flight", "/hotel",
            "/history", "/profile", "/admin", "/signup"})
    public String forward() {
        return "forward:/index.html";
    }
}

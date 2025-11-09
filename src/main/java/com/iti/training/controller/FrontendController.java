package com.iti.training.controller;

import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;

/**
 * Frontend Controller - Serves the main HTML template
 * This controller handles routing for the single-page application
 */
@Controller
@RequestMapping("/")
public class FrontendController {

    /**
     * Serve the main application template
     * @return The name of the HTML template (without extension)
     */
    @GetMapping(value = {"/", "/dashboard", "/students", "/courses", "/exams", "/questions", "/attempts", "/choices"})
    public String index() {
        return "index";
    }

    /**
     * Handle any other routes that should serve the SPA
     * This ensures that client-side routing works properly
     */
    @GetMapping(value = "/{path:[^\\.]*}")
    public String redirect() {
        return "index";
    }
}
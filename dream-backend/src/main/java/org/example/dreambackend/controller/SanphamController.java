package org.example.dreambackend.controller;

import io.swagger.v3.oas.annotations.Parameter;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/khach-hang")
public class SanphamController {
    @GetMapping("/hien-thi")
    public String getUser(
            @Parameter(description = "ID của người dùng", required = true)
            @RequestParam String userId) {
        return "User ID: " + userId;
    }

}

package com.example.dreambackend.controllers;

import com.example.dreambackend.entities.NhanVien;
import com.example.dreambackend.repositories.NhanVienRepository;
import com.example.dreambackend.security.JwtResponse;
import com.example.dreambackend.security.LoginRequest;
import com.example.dreambackend.security.MessageResponse;
import com.example.dreambackend.security.SignupRequest;
import com.example.dreambackend.security.UserDetailsImpl;
import com.example.dreambackend.security.jwt.JwtUtils;
import com.example.dreambackend.services.jwt.AuthService;
import com.example.dreambackend.services.jwt.UserDetailsServiceImpl;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

@CrossOrigin(origins = "*", maxAge = 3600)
@RestController
@RequestMapping("/api/auth")
public class AuthController {
    @Autowired
    AuthenticationManager authenticationManager;

    @Autowired
    UserDetailsServiceImpl userDetailsService;

    @Autowired
    JwtUtils jwtUtils;

    @Autowired
    AuthService authService;

    @Autowired
    NhanVienRepository nhanVienRepository;

    @Autowired
    PasswordEncoder passwordEncoder;

    @PostMapping({"/signin", "/login"})
    public ResponseEntity<?> authenticateUser(@RequestBody LoginRequest loginRequest) {
        try {
            // Tìm user bằng username hoặc email
            NhanVien nhanVien = nhanVienRepository.findByTaiKhoan(loginRequest.getUsername())
                    .orElseGet(() -> nhanVienRepository.findByEmail(loginRequest.getUsername())
                            .orElseThrow(() -> new RuntimeException("Tài khoản không đúng")));

            if (!passwordEncoder.matches(loginRequest.getPassword(), nhanVien.getMatKhau())) {
                throw new RuntimeException("Mật khẩu không đúng");
            }

            // Xác thực với username là tài khoản của user
            Authentication authentication = authenticationManager.authenticate(
                    new UsernamePasswordAuthenticationToken(nhanVien.getTaiKhoan(), loginRequest.getPassword()));

            SecurityContextHolder.getContext().setAuthentication(authentication);
            String jwt = jwtUtils.generateJwtToken(authentication);

            UserDetailsImpl userDetails = (UserDetailsImpl) authentication.getPrincipal();
            String role = userDetails.getAuthorities().iterator().next().getAuthority();

            // Tạo response với thông tin chi tiết
            Map<String, Object> response = new HashMap<>();
            response.put("status", "success");
            response.put("message", "Đăng nhập thành công");
            response.put("token", jwt);
            response.put("tokenType", "Bearer");
            response.put("user", Map.of(
                "id", userDetails.getId(),
                "username", userDetails.getUsername(),
                "email", userDetails.getEmail(),
                "role", role
            ));

            return ResponseEntity.ok(response);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(new MessageResponse("Error: " + e.getMessage()));
        }
    }

    @PostMapping("/signup")
    public ResponseEntity<?> registerUser(@RequestBody SignupRequest signUpRequest) {
        if (nhanVienRepository.existsByTaiKhoan(signUpRequest.getUsername())) {
            return ResponseEntity
                    .badRequest()
                    .body(new MessageResponse("Error: Username is already taken!"));
        }

        if (nhanVienRepository.existsByEmail(signUpRequest.getEmail())) {
            return ResponseEntity
                    .badRequest()
                    .body(new MessageResponse("Error: Email is already in use!"));
        }

        NhanVien user = authService.registerUser(
                signUpRequest.getUsername(),
                signUpRequest.getEmail(),
                signUpRequest.getPassword(),
                signUpRequest.getRole());

        return ResponseEntity.ok(new MessageResponse("User registered successfully!"));
    }
} 
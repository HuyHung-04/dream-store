package com.example.dreambackend.configs;

import com.example.dreambackend.security.AuthTokenFilter;
import com.example.dreambackend.security.AuthEntryPointJwt;
import com.example.dreambackend.security.CustomAccessDeniedHandler;
import com.example.dreambackend.security.jwt.JwtUtils;
import com.example.dreambackend.services.jwt.UserDetailsServiceImpl;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.dao.DaoAuthenticationProvider;
import org.springframework.security.config.annotation.authentication.configuration.AuthenticationConfiguration;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.access.AccessDeniedHandler;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

import java.util.Arrays;

@Configuration
@EnableMethodSecurity(prePostEnabled = true)
public class SecurityConfig {
    @Autowired
    UserDetailsServiceImpl userDetailsService;

    @Autowired
    private AuthEntryPointJwt unauthorizedHandler;

    @Autowired
    private JwtUtils jwtUtils;

    @Bean
    public AuthTokenFilter authenticationJwtTokenFilter() {
        AuthTokenFilter authTokenFilter = new AuthTokenFilter();
        authTokenFilter.setJwtUtils(jwtUtils);
        authTokenFilter.setUserDetailsService(userDetailsService);
        return authTokenFilter;
    }

    @Bean
    public DaoAuthenticationProvider authenticationProvider() {
        DaoAuthenticationProvider authProvider = new DaoAuthenticationProvider();
        authProvider.setUserDetailsService(userDetailsService);
        authProvider.setPasswordEncoder(passwordEncoder());
        return authProvider;
    }

    @Bean
    public AuthenticationManager authenticationManager(AuthenticationConfiguration authConfig) throws Exception {
        return authConfig.getAuthenticationManager();
    }

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }

    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http, AccessDeniedHandler accessDeniedHandler, CustomAccessDeniedHandler customAccessDeniedHandler) throws Exception {
        http.cors().and().csrf().disable()
                .exceptionHandling().authenticationEntryPoint(unauthorizedHandler).accessDeniedHandler(customAccessDeniedHandler).and()
                .sessionManagement().sessionCreationPolicy(SessionCreationPolicy.STATELESS).and()
                .authorizeHttpRequests()
                .requestMatchers("/api/auth/**").permitAll()
                .requestMatchers("/swagger-ui/**", "/v3/api-docs/**").permitAll()
                .requestMatchers("/uploads/images/**").permitAll()

                .requestMatchers("/api/ban-hang-online/**").hasAnyRole("Quản lý", "Nhân viên")
                .requestMatchers("/api/hoa-don/**").hasAnyRole("Quản lý", "Nhân viên")
                .requestMatchers("/api/hoa-don-online/**").hasAnyRole("Quản lý", "Nhân viên")
                .requestMatchers("/api/khach-hang/**").hasAnyRole("Quản lý", "Nhân viên")
                .requestMatchers("/api/gio-hang/**").hasAnyRole("Quản lý", "Nhân viên")
                .requestMatchers("/api/dia-chi-khach-hang/**").hasAnyRole("Quản lý", "Nhân viên")
                .requestMatchers("/api/phuong-thuc-thanh-toan/**").hasAnyRole("Quản lý", "Nhân viên")
                .requestMatchers("/vnpay/**").hasAnyRole("Quản lý", "Nhân viên")

                // Nhân viên chỉ được xem sản phẩm, không được thêm/sửa
                .requestMatchers(HttpMethod.GET, "/api/thuong-hieu/**").hasAnyRole("Quản lý", "Nhân viên")
                .requestMatchers(HttpMethod.GET, "/api/san-pham/**").hasAnyRole("Quản lý", "Nhân viên")
                .requestMatchers(HttpMethod.GET, "/api/san-pham-chi-tiet/**").hasAnyRole("Quản lý", "Nhân viên")
                .requestMatchers(HttpMethod.GET, "/api/khuyen-mai/**").hasAnyRole("Quản lý", "Nhân viên")
                .requestMatchers(HttpMethod.GET, "/api/voucher/**").hasAnyRole("Quản lý", "Nhân viên")

                // Các phương thức thêm/sửa/xóa sản phẩm chỉ cho phép Quản lý
                .requestMatchers(HttpMethod.POST, "/api/san-pham/**").hasRole("Quản lý")
                .requestMatchers(HttpMethod.PUT, "/api/san-pham/**").hasRole("Quản lý")
                .requestMatchers(HttpMethod.DELETE, "/api/san-pham/**").hasRole("Quản lý")

                // Nhân viên không được truy cập thống kê
                .requestMatchers("/api/thong-ke/**").hasRole("Quản lý")

                // Nhân viên không được quản lý nhân viên
                .requestMatchers("/api/nhan-vien/**").hasRole("Quản lý")

                // Thuộc tính (ví dụ loại sản phẩm, màu sắc) chỉ Quản lý mới thêm
                .requestMatchers(HttpMethod.POST, "/api/thuoc-tinh/**").hasRole("Quản lý")
                .requestMatchers(HttpMethod.PUT, "/api/thuoc-tinh/**").hasRole("Quản lý")
                .requestMatchers(HttpMethod.DELETE, "/api/thuoc-tinh/**").hasRole("Quản lý")
                .requestMatchers(HttpMethod.GET, "/api/thuoc-tinh/**").hasAnyRole("Quản lý", "Nhân viên")

                // Các API còn lại phải authenticated
                .anyRequest().authenticated();

        http.authenticationProvider(authenticationProvider());
        http.addFilterBefore(authenticationJwtTokenFilter(), UsernamePasswordAuthenticationFilter.class);

        return http.build();
    }

    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration configuration = new CorsConfiguration();
        configuration.setAllowedOrigins(Arrays.asList("*"));
        configuration.setAllowedMethods(Arrays.asList("GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"));
        configuration.setAllowedHeaders(Arrays.asList("authorization", "content-type", "x-auth-token"));
        configuration.setExposedHeaders(Arrays.asList("x-auth-token"));
        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", configuration);
        return source;
    }
} 
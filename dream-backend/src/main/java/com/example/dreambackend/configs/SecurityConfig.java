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
                .requestMatchers("/api/nhan-vien/image/**").permitAll()

                .requestMatchers("/api/ban-hang-online/**").permitAll()
                .requestMatchers("/api/hoa-don/**").permitAll()
                .requestMatchers("/api/hoa-don-online/**").permitAll()
                .requestMatchers("/api/khach-hang/**").permitAll()
                .requestMatchers("/api/gio-hang/**").permitAll()
                .requestMatchers("/api/dia-chi-khach-hang/**").permitAll()
                .requestMatchers("/api/phuong-thuc-thanh-toan/**").permitAll()
                .requestMatchers("/vnpay/**").permitAll()

                // Nhân viên chỉ được xem sản phẩm, không được thêm/sửa
                .requestMatchers(HttpMethod.GET, "/api/thuong-hieu/**").permitAll()
                .requestMatchers(HttpMethod.GET, "/api/mau-sac/**").permitAll()
                .requestMatchers(HttpMethod.GET, "/api/size/**").permitAll()
                .requestMatchers(HttpMethod.GET, "/api/xuat-xu/**").permitAll()
                .requestMatchers(HttpMethod.GET, "/api/chat-lieu/**").permitAll()
                .requestMatchers(HttpMethod.GET, "/api/co-ao/**").permitAll()
                .requestMatchers(HttpMethod.POST, "/api/thuong-hieu/**").hasRole("Quản lý")
                .requestMatchers(HttpMethod.POST, "/api/mau-sac/**").hasRole("Quản lý")
                .requestMatchers(HttpMethod.POST, "/api/size/**").hasRole("Quản lý")
                .requestMatchers(HttpMethod.POST, "/api/xuat-xu/**").hasRole("Quản lý")
                .requestMatchers(HttpMethod.POST, "/api/chat-lieu/**").hasRole("Quản lý")
                .requestMatchers(HttpMethod.POST, "/api/co-ao/**").hasRole("Quản lý")
                .requestMatchers(HttpMethod.PUT, "/api/thuong-hieu/**").hasRole("Quản lý")
                .requestMatchers(HttpMethod.PUT, "/api/mau-sac/**").hasRole("Quản lý")
                .requestMatchers(HttpMethod.PUT, "/api/size/**").hasRole("Quản lý")
                .requestMatchers(HttpMethod.PUT, "/api/xuat-xu/**").hasRole("Quản lý")
                .requestMatchers(HttpMethod.PUT, "/api/chat-lieu/**").hasRole("Quản lý")
                .requestMatchers(HttpMethod.PUT, "/api/co-ao/**").hasRole("Quản lý")
                .requestMatchers(HttpMethod.GET, "/api/san-pham/**").hasAnyRole("Quản lý", "Nhân viên")
                .requestMatchers(HttpMethod.GET, "/api/san-pham-chi-tiet/**").hasAnyRole("Quản lý", "Nhân viên")
                .requestMatchers(HttpMethod.GET, "/api/khuyenmai/{khuyenMaiId}/select-products").hasRole("Quản lý")
                .requestMatchers(HttpMethod.GET, "/api/khuyenmai/**").hasAnyRole("Quản lý", "Nhân viên")
                .requestMatchers(HttpMethod.GET, "/api/voucher/**").hasAnyRole("Quản lý", "Nhân viên")

                .requestMatchers(HttpMethod.POST, "/api/voucher/**").hasRole("Quản lý")
                .requestMatchers(HttpMethod.POST, "/api/khuyenmai/**").hasRole("Quản lý")

                // Các phương thức thêm/sửa sản phẩm chỉ cho phép Quản lý
                .requestMatchers(HttpMethod.POST, "/api/san-pham/**").hasRole("Quản lý")
                .requestMatchers(HttpMethod.PUT, "/api/san-pham/**").hasRole("Quản lý")
                .requestMatchers(HttpMethod.POST, "/api/san-pham-chi-tiet/**").hasRole("Quản lý")
                .requestMatchers(HttpMethod.PUT, "/api/san-pham-chi-tiet/**").hasRole("Quản lý")

                .requestMatchers(HttpMethod.GET, "/api/anh/**").hasRole("Quản lý")

                // Nhân viên không được truy cập thống kê
                .requestMatchers("/api/thong-ke/**").hasRole("Quản lý")

                // Nhân viên không được quản lý nhân viên
                .requestMatchers("/api/nhan-vien/**").hasRole("Quản lý")
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
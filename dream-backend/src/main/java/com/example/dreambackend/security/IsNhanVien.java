package com.example.dreambackend.security;

import org.springframework.security.access.prepost.PreAuthorize;

import java.lang.annotation.*;

@Target({ ElementType.METHOD, ElementType.TYPE })
@Retention(RetentionPolicy.RUNTIME)
@Documented
@PreAuthorize("hasAuthority('Nhân viên')")
public @interface IsNhanVien {
} 
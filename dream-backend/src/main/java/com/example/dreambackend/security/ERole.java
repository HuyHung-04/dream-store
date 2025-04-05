package com.example.dreambackend.security;

public enum ERole {
    ROLE_QUAN_LY("Quản lý"),
    ROLE_NHAN_VIEN("Nhân viên"),
    ROLE_KHACH_HANG("Khách hàng");

    private final String ten;

    ERole(String ten) {
        this.ten = ten;
    }

    public String getTen() {
        return ten;
    }

    public static ERole fromString(String text) {
        for (ERole role : ERole.values()) {
            if (role.ten.equalsIgnoreCase(text)) {
                return role;
            }
        }
        return null;
    }
} 
package com.example.dreambackend.services.jwt;

import com.example.dreambackend.entities.NhanVien;
import com.example.dreambackend.entities.VaiTro;
import com.example.dreambackend.repositories.NhanVienRepository;
import com.example.dreambackend.security.ERole;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.util.HashSet;
import java.util.Set;

@Service
public class AuthService {
    @Autowired
    NhanVienRepository nhanVienRepository;

    @Autowired
    RoleService roleService;

    @Autowired
    PasswordEncoder encoder;

    public NhanVien registerUser(String username, String email, String password, String role) {
        NhanVien nhanVien = new NhanVien();
        nhanVien.setTaiKhoan(username);
        nhanVien.setEmail(email);
        nhanVien.setMatKhau(encoder.encode(password));
        nhanVien.setNgayTao(LocalDate.now());
        nhanVien.setNgaySua(LocalDate.now());
        nhanVien.setTrangThai(1);

        VaiTro vaiTro;
        switch (role) {
            case "QUAN_LY":
                vaiTro = roleService.findByName(ERole.ROLE_QUAN_LY)
                        .orElseThrow(() -> new RuntimeException("Error: Role is not found."));
                break;
            case "NHAN_VIEN":
                vaiTro = roleService.findByName(ERole.ROLE_NHAN_VIEN)
                        .orElseThrow(() -> new RuntimeException("Error: Role is not found."));
                break;
            default:
                vaiTro = roleService.findByName(ERole.ROLE_KHACH_HANG)
                        .orElseThrow(() -> new RuntimeException("Error: Role is not found."));
        }

        nhanVien.setVaiTro(vaiTro);
        return nhanVienRepository.save(nhanVien);
    }
} 
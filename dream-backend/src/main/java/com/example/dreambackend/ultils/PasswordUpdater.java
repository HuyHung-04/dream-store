package com.example.dreambackend.ultils;

import com.example.dreambackend.entities.NhanVien;
import com.example.dreambackend.repositories.NhanVienRepository;
import jakarta.annotation.PostConstruct;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import java.util.List;

@Component
public class PasswordUpdater {

    @Autowired
    private NhanVienRepository nhanVienRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @PostConstruct
    public void updatePasswords() {
        List<NhanVien> nhanViens = nhanVienRepository.findAll();
        for (NhanVien nhanVien : nhanViens) {
            if (!nhanVien.getMatKhau().startsWith("$2a$")) {
                String encodedPassword = passwordEncoder.encode(nhanVien.getMatKhau());
                nhanVien.setMatKhau(encodedPassword);
                nhanVienRepository.save(nhanVien);
            }
        }
    }
} 
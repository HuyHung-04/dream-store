package com.example.dreambackend.configs;

import com.example.dreambackend.entities.VaiTro;
import com.example.dreambackend.repositories.VaiTroRepository;
import com.example.dreambackend.security.ERole;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

@Component
public class DataInitializer implements CommandLineRunner {

    @Autowired
    private VaiTroRepository vaiTroRepository;

    @Override
    public void run(String... args) throws Exception {
        // Khởi tạo vai trò nếu chưa tồn tại
        if (vaiTroRepository.count() == 0) {
            VaiTro roleQuanLy = new VaiTro();
            roleQuanLy.setTen(ERole.ROLE_QUAN_LY.getTen());
            roleQuanLy.setTrangThai(1);
            vaiTroRepository.save(roleQuanLy);

            VaiTro roleNhanVien = new VaiTro();
            roleNhanVien.setTen(ERole.ROLE_NHAN_VIEN.getTen());
            roleNhanVien.setTrangThai(1);
            vaiTroRepository.save(roleNhanVien);

            VaiTro roleKhachHang = new VaiTro();
            roleKhachHang.setTen(ERole.ROLE_KHACH_HANG.getTen());
            roleKhachHang.setTrangThai(1);
            vaiTroRepository.save(roleKhachHang);
        }
    }
} 
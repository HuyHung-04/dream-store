// Service Implementation
package com.example.dreambackend.services.NhanVien;

import com.example.dreambackend.entities.NhanVien;
import com.example.dreambackend.repositories.NhanVienRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

@Service
public class NhanVienService implements INhanVienService {

    @Autowired
    private NhanVienRepository nhanVienRepository;

    @Override
    public List<NhanVien> getAllNhanVien() {
        return nhanVienRepository.findAll();
    }

    @Override
    public Optional<NhanVien> getNhanVienById(int id) {
        return nhanVienRepository.findById(id);
    }

    @Override
    public NhanVien createNhanVien(NhanVien nhanVien) {
        nhanVien.setNgayTao(LocalDate.now());
        nhanVien.setTrangThai(1); // Active by default
        return nhanVienRepository.save(nhanVien);
    }

    @Override
    public NhanVien updateNhanVien(int id, NhanVien updatedNhanVien) {
        return nhanVienRepository.findById(id).map(nhanVien -> {
            nhanVien.setTen(updatedNhanVien.getTen());
            nhanVien.setNgaySinh(updatedNhanVien.getNgaySinh());
            nhanVien.setGioiTinh(updatedNhanVien.isGioiTinh());
            nhanVien.setEmail(updatedNhanVien.getEmail());
            nhanVien.setSoDienThoai(updatedNhanVien.getSoDienThoai());
            nhanVien.setTaiKhoan(updatedNhanVien.getTaiKhoan());
            nhanVien.setMatKhau(updatedNhanVien.getMatKhau());
            nhanVien.setAnh(updatedNhanVien.getAnh());
            nhanVien.setNgaySua(LocalDate.now());
            return nhanVienRepository.save(nhanVien);
        }).orElseThrow(() -> new RuntimeException("NhanVien not found with id: " + id));
    }

    @Override
    public void deleteNhanVien(int id) {
        nhanVienRepository.deleteById(id);
    }
}
// Service Interface
package com.example.dreambackend.services.NhanVien;

import com.example.dreambackend.entities.NhanVien;

import java.util.List;
import java.util.Optional;

public interface INhanVienService {
    List<NhanVien> getAllNhanVien();
    Optional<NhanVien> getNhanVienById(int id);
    NhanVien createNhanVien(NhanVien nhanVien);
    NhanVien updateNhanVien(int id, NhanVien updatedNhanVien);
    void deleteNhanVien(int id);
}
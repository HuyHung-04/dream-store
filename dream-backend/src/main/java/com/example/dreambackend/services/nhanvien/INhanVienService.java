package com.example.dreambackend.services.nhanvien;

import com.example.dreambackend.entities.NhanVien;
import org.springframework.data.domain.Page;
import org.springframework.http.ResponseEntity;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.List;

public interface INhanVienService {
    Page<NhanVien> getAllNhanVienPaged(int page, int size, Integer idNhanVien);
    NhanVien addNhanVien(NhanVien nhanVien);
    NhanVien updateNhanVien(NhanVien nhanVien);
    NhanVien getNhanVienById(Integer id);
    List<NhanVien> searchNhanVienByName(String ten);
    NhanVien addImageForNhanVien(Integer nhanVienId, MultipartFile file) throws IOException;
    // Phương thức đăng nhập (trả về boolean)
    ResponseEntity<?> login(String email, String password);
    Page<NhanVien> getNhanVienByTrangThai(Integer trangThai, int page, int size, Integer idNhanVien);
    Page<NhanVien> getAllNhanVien(int page, int size);
}

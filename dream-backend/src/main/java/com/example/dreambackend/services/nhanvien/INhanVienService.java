package com.example.dreambackend.services.nhanvien;

import com.example.dreambackend.entities.NhanVien;
import com.example.dreambackend.request.NhanVienRequest;
import com.example.dreambackend.responses.NhanVienResponse;

import java.util.List;

public interface INhanVienService {
    List<NhanVienResponse> getAllNhanVien();
    List<NhanVienResponse> searchNhanVienByName(String ten);
    List<NhanVienResponse> filterNhanVienByTrangThai(Integer trangThai);
    NhanVien addNhanVien(NhanVienRequest nhanVienRequest);
    NhanVien updateNhanVien(NhanVienRequest nhanVienRequest);
}

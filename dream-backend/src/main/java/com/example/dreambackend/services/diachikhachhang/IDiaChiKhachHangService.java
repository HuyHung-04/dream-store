package com.example.dreambackend.services.diachikhachhang;

import com.example.dreambackend.entities.DiaChiKhachHang;
import com.example.dreambackend.requests.DiaChiKhachHangRequest;
import com.example.dreambackend.responses.DiaChiKhachHangRespone;

import java.util.List;

public interface IDiaChiKhachHangService {
    List<DiaChiKhachHang> getDiaChiKhachHang(Integer idKhachHang);

    DiaChiKhachHang addDiaChi(DiaChiKhachHang diaChiKhachHang);

    DiaChiKhachHang updateDiaChi(DiaChiKhachHang diachi);

    Integer getIdBySdtNguoiNhan(String sdtNguoiNhan);

    DiaChiKhachHang getDiaChiById(Integer id);

    void deleteDiaChi(Integer id);
}

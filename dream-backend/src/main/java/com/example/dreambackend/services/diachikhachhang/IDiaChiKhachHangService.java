package com.example.dreambackend.services.diachikhachhang;

import com.example.dreambackend.entities.DiaChiKhachHang;
import com.example.dreambackend.requests.DiaChiKhachHangRequest;
import com.example.dreambackend.responses.DiaChiKhachHangRespone;

import java.util.List;

public interface IDiaChiKhachHangService {
    List<DiaChiKhachHangRespone> getDiaChiKhachHang(Integer idKhachHang);

    DiaChiKhachHang addDiaChi(DiaChiKhachHangRequest request);

    DiaChiKhachHang updateDiaChi(Integer id, DiaChiKhachHangRequest request);
}

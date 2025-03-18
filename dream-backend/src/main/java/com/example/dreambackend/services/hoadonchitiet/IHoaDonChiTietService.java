package com.example.dreambackend.services.hoadonchitiet;

import com.example.dreambackend.entities.HoaDon;
import com.example.dreambackend.entities.HoaDonChiTiet;
import com.example.dreambackend.responses.HoaDonChiTietResponse;

import java.util.List;

public interface IHoaDonChiTietService {
    HoaDonChiTietResponse addSanPhamToHoaDon(Integer hoaDonId, Integer sanPhamId, Integer soLuong);

    HoaDonChiTietResponse updateHoaDonChiTiet(Integer id, Integer soLuong);

    void removeSanPhamFromHoaDon(Integer id);

    HoaDonChiTietResponse findById(Integer id);

    List<HoaDonChiTietResponse> findByHoaDon(HoaDon hoaDon);
}

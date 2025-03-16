package com.example.dreambackend.services.giohangchitiet;

import com.example.dreambackend.entities.GioHangChiTiet;
import com.example.dreambackend.entities.HoaDon;
import com.example.dreambackend.requests.GioHangChiTietRequest;
import com.example.dreambackend.responses.GioHangChiTietResponse;

import java.util.List;

public interface IGioHangChiTietService {
    List<GioHangChiTietResponse> getGioHangChiTietByKhachHangId(Integer idKhachHang);

    GioHangChiTietResponse themSanPhamVaoGio(GioHangChiTietRequest request);

    void xoaSanPhamKhoiGio(Integer idGioHangChiTiet);

    GioHangChiTietResponse suaSoLuongSanPham(Integer idGioHangChiTiet, Integer soLuongMoi);

    GioHangChiTietResponse muaNgay(GioHangChiTietRequest request);
}
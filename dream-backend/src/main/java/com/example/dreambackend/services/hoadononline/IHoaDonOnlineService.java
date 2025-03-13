package com.example.dreambackend.services.hoadononline;

import com.example.dreambackend.entities.HoaDon;
import com.example.dreambackend.entities.HoaDonChiTiet;
import com.example.dreambackend.responses.GioHangChiTietResponse;

import java.util.List;

public interface IHoaDonOnlineService {
    List<Integer> getGioHangIdsForThanhToan(Integer idKhachHang);
    List<GioHangChiTietResponse> getChiTietGioHangSauThanhToan(Integer idKhachHang);
    Double calculateTotalPrice(Integer idKhachHang);
    Double calculateTotalPriceWithVoucher(Integer idKhachHang, Integer voucherId);
}

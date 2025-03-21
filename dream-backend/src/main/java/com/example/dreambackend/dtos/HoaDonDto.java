package com.example.dreambackend.dtos;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class HoaDonDto {
    private Integer idHoaDon;
    private String maHoaDon;
    private Double tongTienThanhToan;
    private Integer idHoaDonChiTiet;
    private String maSanPham;
    private String tenSanPham;
    private Integer soLuong;
    private String mauSac;
    private Double donGia;
    private String size;
    private String anhUrl;
}

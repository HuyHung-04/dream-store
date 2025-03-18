package com.example.dreambackend.dtos;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;
@Data
@NoArgsConstructor
@AllArgsConstructor
public class HoaDonChiTietDto {
    private String maSanPham;
    private String tenSanPham;
    private Double donGia;
    private Integer soLuong;
    private String mauSac;
    private String size;
    private List<String> anhUrls;
}

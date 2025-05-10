package com.example.dreambackend.dtos;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class SanPhamChiTietViewDto {
    private String ma;
    private String tenSanPham;
    private String mauSac;
    private String size;
    private int soLuong;
}

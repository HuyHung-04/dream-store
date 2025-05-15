package com.example.dreambackend.dtos;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class SanPhamThieuDto {
    private String maSPCT;
    private String tenSanPham;
    private String mauSac;
    private String size;
    private Long soLuongThieu;
}

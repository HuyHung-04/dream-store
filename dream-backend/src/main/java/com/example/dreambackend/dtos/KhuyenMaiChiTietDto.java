package com.example.dreambackend.dtos;

import com.example.dreambackend.entities.KhuyenMai;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class KhuyenMaiChiTietDto {
    private KhuyenMai khuyenMai;
    private List<SanPhamChiTietViewDto> danhSachSanPham;
}

package com.example.dreambackend.dtos;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class SanPhamChiTietOnlineDto {
    private Integer idSanPhamChiTiet;
    private String tenSanPham;
    private String anhUrl;
    private Double giaGoc;
    private String tenChatLieu;
    private String tenCoAo;
    private String tenThuongHieu;
    private String tenXuatXu;
    private String tenMauSac;
    private String tenSize;
    private Integer soLuongSanPham;
    private Integer soLuongGioHang;
    private Double giaTriGiam;
}

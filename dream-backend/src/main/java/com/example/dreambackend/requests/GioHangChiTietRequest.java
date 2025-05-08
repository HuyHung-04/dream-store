package com.example.dreambackend.requests;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class GioHangChiTietRequest {
    private Integer idKhachHang;

    private Integer idSanPhamChiTiet;

    private Integer soLuong;

    private Double donGia;

    private Integer trangThai;
}

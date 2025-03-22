package com.example.dreambackend.responses;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
@Data
@NoArgsConstructor
@AllArgsConstructor
public class GetSanPhamToBanHangRespone {
    private Integer id; //spct

    private String maSanPhamChiTiet; //spct

    private String tenSanPham; //sp

    private Double gia;//spct

    private Integer soLuong; //spct

    private String tenMau; // bảng màu

    private String tenSize; // size

    private Double giaTriGiam; // bảng khuyến mại

    private String anhUrl;
}

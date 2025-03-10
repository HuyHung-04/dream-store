package com.example.dreambackend.responses;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDate;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class ThanhToanDonHangOnlineRespone {
    private Integer id;

    private String anhUrl;

    private String tenSanPham;

    private String mau;

    private String size;

    private Integer soLuong;

    private Double donGia;

    private Boolean hinhThucGiam; // True: Giảm tiền, False: Giảm %

    private BigDecimal giaTriGiam;
}

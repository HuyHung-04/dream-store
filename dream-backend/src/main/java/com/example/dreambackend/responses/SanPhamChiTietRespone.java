package com.example.dreambackend.responses;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class SanPhamChiTietRespone {
    private Integer id;

    private String ma;

    private Double gia;

    private int soLuong;

    private LocalDate ngayTao;

    private LocalDate ngaySua;

    private int trangThai;

    private Integer idSanPham;

    private String tenSanPham;

    private Integer idSize;

    private String tenSize;

    private Integer idMauSac;

    private String tenMauSac;

    private String tenKhuyenMai;

    private Double giaSauGiam;

}

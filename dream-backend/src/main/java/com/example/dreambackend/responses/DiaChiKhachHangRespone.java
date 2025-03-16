package com.example.dreambackend.responses;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
@Data
@NoArgsConstructor
@AllArgsConstructor
public class DiaChiKhachHangRespone {
    private Integer id;

    private String diaChiCuThe;

    private String phuongXa;

    private String quanHuyen;

    private String tinhThanhPho;

    private String moTa;

    private  String tenNguoiNhan;

    private String sdtNguoiNhan;

    private LocalDate ngayTao;

    private LocalDate ngaySua;

    private Boolean trangThai;

    private Integer idKhachHang;

    private String tenKhachHang;

    private String soDienThoai;
}

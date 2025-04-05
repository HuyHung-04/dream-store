package com.example.dreambackend.requests;

import lombok.Data;

import java.time.LocalDate;

@Data
public class HoaDonChiTietSearchRequest {
    private Integer idHoaDon;
    private String maHoaDon;
    private String tenNhanVien;
    private String tenSanPham;
    private String tenKhachHang;
    private Double donGia;
    private String sdtNguoiNhan;
    private LocalDate ngayTaoTu;
    private LocalDate ngayTaoDen;
    private LocalDate ngaySuaTu;
    private LocalDate ngaySuaDen;
    private Integer page;
    private Integer pageSize;
    private Integer totalRecords;
}
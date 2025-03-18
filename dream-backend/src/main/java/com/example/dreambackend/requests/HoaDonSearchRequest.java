package com.example.dreambackend.requests;

import lombok.Data;

import java.time.LocalDate;
import java.util.List;

@Data
public class HoaDonSearchRequest {
    private String maHoaDon;
    private String tenKhachHang;
    private String tenNhanVien;
    private LocalDate ngayTaoFrom;
    private LocalDate ngayTaoTo;
    private Integer listTrangThai;
    private Integer totalRecords;
    private Integer page;
    private Integer pageSize;
}
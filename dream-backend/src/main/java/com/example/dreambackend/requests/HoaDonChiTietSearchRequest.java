package com.example.dreambackend.requests;

import lombok.Data;

import java.time.LocalDate;

@Data
public class HoaDonChiTietSearchRequest {
    private Integer idHoaDon;
    private String maHoaDon;
    private String tenSanPham;
    private Double donGia;
    private LocalDate ngayTaoTu;
    private LocalDate ngayTaoDen;
    private Integer page;
    private Integer pageSize;
    private Integer totalRecords;
}
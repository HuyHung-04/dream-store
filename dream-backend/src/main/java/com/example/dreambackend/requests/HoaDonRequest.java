package com.example.dreambackend.requests;

import com.fasterxml.jackson.annotation.JsonInclude;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@JsonInclude(JsonInclude.Include.NON_NULL)
public class HoaDonRequest {
    private Integer idKhachHang;
    private Integer idNhanVien;
    private Integer idVoucher;
    private Integer idPhuongThucThanhToan;
    private String tenNguoiNhan;
    private String sdtNguoiNhan;
    private String diaChiNhanHang;
    private String hinhThucThanhToan;
    private Double phiVanChuyen;
    private Double tongTienTruocVoucher;
    private Double tongTienThanhToan;
    private LocalDate ngayNhanDuKien;
    private LocalDate ngayTao;
    private LocalDate ngaySua;
    private Integer trangThai;
    private String ghiChu;
}
package com.example.dreambackend.requests;

import com.example.dreambackend.entities.KhachHang;
import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
@Data
@NoArgsConstructor
@AllArgsConstructor
public class DiaChiKhachHangRequest {
    private String diaChiCuThe;
    private String tenNguoiNhan;
    private String sdtNguoiNhan;
    private String phuongXa;
    private String quanHuyen;
    private String tinhThanhPho;
    private String moTa;
    private LocalDate ngayTao;
    private LocalDate ngaySua;
    private Boolean trangThai;
    private Integer idKhachHang; // Nhận ID khách hàng từ request
}

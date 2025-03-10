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
    private Integer id;

    @NotBlank(message = "Thông tin không được để trống")
    private String thon;

    private String phuongXa;

    private String quanHuyen;

    @NotBlank(message = "Thông tin không được để trống")
    private String tinhThanhPho;

    private String moTa;

    private LocalDate ngayTao;

    private LocalDate ngaySua;

    private Boolean trangThai;

    @NotBlank(message = "Thông tin không được để trống")
    private String tenKhachHang;

    private String soDienThoai;
}

package com.example.dreambackend.dtos;

import com.fasterxml.jackson.annotation.JsonProperty;
import jakarta.persistence.Column;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.Date;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class HoaDonDTO {

    private String ma;

    @JsonProperty("ten_nguoi_nhan")
    private String tenNguoiNhan;

    @JsonProperty("dia_chi_nhan_hang")
    private String diaChiNhanHang;

    @JsonProperty("sdt_nguoi_nhan")
    private int sdtNhanHang;

    @JsonProperty("tong_tien")
    private Float tongTien;

    @JsonProperty("tong_tien_sau_giam")
    private Float tongTienSauGiam;

    @JsonProperty("hinh_thuc_thanh_toan")
    private int hinhThucThanhToan;

    @JsonProperty("phi_van_chuyen")
    private Float phiVanChuyen;


    private Date ngayTao;

    private Date ngaySua;

    @JsonProperty("trang_thai")
    private int trangThai;
}

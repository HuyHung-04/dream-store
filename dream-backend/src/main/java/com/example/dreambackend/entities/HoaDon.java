package com.example.dreambackend.entities;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.Date;

@Entity
@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder
@Table(name = "hoa_don")
public class HoaDon {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @Column(name = "ma")
    private String ma;

    @Column(name = "ten_nguoi_nhan")
    private String tenNguoiNhan;

    @Column(name = "dia_chi_nhan_hang")
    private String diaChiNhanHang;

    @Column(name = "sdt_nguoi_nhan")
    private int sdtNhanHang;

    @Column(name = "tong_tien")
    private Float tongTien;

    @Column(name = "tong_tien_sau_giam")
    private Float tongTienSauGiam;

    @Column(name = "hinh_thuc_thanh_toan")
    private int hinhThucThanhToan;

    @Column(name = "phi_van_chuyen")
    private Float phiVanChuyen;

    @Column(name = "ngay_tao")
    private Date ngayTao;

    @Column(name = "ngay_sua")
    private Date ngaySua;

    @Column(name = "trang_thai")
    private int trangThai;
}

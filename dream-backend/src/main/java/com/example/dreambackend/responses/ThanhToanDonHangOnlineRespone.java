package com.example.dreambackend.responses;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDate;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class ThanhToanDonHangOnlineRespone {
    private String tenKhachHang;

    private String soDienThoai;

    private String thon;

    private String phuongXa;

    private String quanHuyen;

    private String tinhThanhPho;

    private String moTa; // mô tả của hoá đơn

    private String tenSanPham; // bảng sản phẩm

    private Double giaGoc; // bảng sản phẩm chi tiết giá chưa giảm giá

    private String tenMauSac;

    private String tenSize;

    private Integer soLuongGioHang;

    private Boolean hinhThucGiam; // giảm của khuyến mại

    private BigDecimal giaTriGiam;

    private Boolean hinhThucGiamVoucher; // giảm của voucher theo hoá đơn

    private BigDecimal giaTriGiamVoucher;

    private Double TienTamTinh; // tiền trước voucher bảng hoá đơn

    private Double phiVanChuyen; // bảng hoá đơn

    private Double tongTienThanhToan; //bảng hoá đơn

    private LocalDate ngayNhanDuKien; // bảng hoá đơn

    private int trangThai; // của hoá đơn
}

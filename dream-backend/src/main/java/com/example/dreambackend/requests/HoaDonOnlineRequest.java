package com.example.dreambackend.requests;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class HoaDonOnlineRequest {
    private Integer idKhachHang;
    private Integer voucherId;
    private Double tongTienTruocGiam;
    private Integer paymentMethodId;
    private Double tongTienSauGiam;
    private String sdtNguoiNhan;
    private String tenNguoiNhan;
    private String diaChi;
    private Double shippingFee;
    private List<GioHangChiTietRequest> chiTietGioHang;
}

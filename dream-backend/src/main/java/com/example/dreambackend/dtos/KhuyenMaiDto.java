package com.example.dreambackend.dtos;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.util.Date;
@Data
@AllArgsConstructor
@NoArgsConstructor
public class KhuyenMaiDto {
    @JsonProperty("ma")
    private String ma; // Mã voucher
    @JsonProperty("ten")
    private String ten;
    @JsonProperty("hinh_thuc_giam")
    private boolean hinhThucGiam;
    @JsonProperty("gia_tri_giam")
    private BigDecimal giaTriGiam;
    @JsonProperty("trang_thai")
    private Integer trangThai;
    @JsonProperty("ngay_tao")
    private Date ngayTao;
    @JsonProperty("ngay_sua")
    private Date ngaySua;
    @JsonProperty("ngay_bat_dau")
    private Date ngayBatDau;
    @JsonProperty("ngay_ket_thuc")
    private Date ngayKetThuc;
}

package com.example.dreambackend.dtos;


import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;


@Data
@AllArgsConstructor
@NoArgsConstructor
public class GioHangDTO {

    @JsonProperty("so_luong")
    private int soLuong;

    @JsonProperty("tong_gia")
    private int tongGia;

    @JsonProperty("gia_sau_giam")
    private int giaSauGiam;

    @JsonProperty("ngay_tao")
    private LocalDate ngayTao;

    @JsonProperty("ngay_sua")
    private LocalDate ngaySua;

    @JsonProperty("id_san_pham_chi_tiet")
    private int idSanPhamChiTiet;

    @JsonProperty("id_khach_hang")
    private int idKhachHang;
}

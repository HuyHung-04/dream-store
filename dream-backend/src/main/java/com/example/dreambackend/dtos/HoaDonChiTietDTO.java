package com.example.dreambackend.dtos;

import com.fasterxml.jackson.annotation.JsonProperty;
import jakarta.persistence.Column;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.util.Date;

@AllArgsConstructor
@NoArgsConstructor
@Data
public class HoaDonChiTietDTO {

    @JsonProperty("so_luong")
    private int soLuong;

    @JsonProperty("don_gia")
    private Float donGia;

    @JsonProperty("ngay_tao")
    private LocalDate ngayTao;

    @JsonProperty("ngay_sua")
    private LocalDate ngaySua;

    @JsonProperty("trang_thai")
    private int trangThai;

    @JsonProperty("id_san_pham_chi_tiet")
    private int idSanPhamChiTiet;

    @JsonProperty("id_hoa_don")
    private int idHoaDon;
}

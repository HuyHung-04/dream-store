package com.example.dreambackend.dtos;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.*;

import java.time.LocalDate;
import java.util.List;

@Data
@AllArgsConstructor
@NoArgsConstructor
@Getter
@Setter
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

    @JsonProperty("ngay_tao")
    private LocalDate ngayTao;

    @JsonProperty("ngay_sua")
    private LocalDate ngaySua;

    @JsonProperty("trang_thai")
    private String trangThai;

    @JsonProperty("id_khach_hang")
    private int idKhachHang;

    @JsonProperty("id_nhan_vien")
    private int idNhanVien;

    @JsonProperty("gio_hang")
    private List<GioHangDTO> gioHang;
}

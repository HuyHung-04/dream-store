package com.example.dreambackend.responses;

import com.example.dreambackend.entities.KhachHang;
import com.example.dreambackend.entities.NhanVien;
import com.example.dreambackend.entities.PhuongThucThanhToan;
import com.example.dreambackend.entities.Voucher;
import com.fasterxml.jackson.annotation.JsonFormat;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;

@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder
@JsonIgnoreProperties(ignoreUnknown = true)
@SqlResultSetMapping(
        name = "HoaDonResponseMapping",
        classes = @ConstructorResult(
                targetClass = HoaDonResponse.class,
                columns = {
                        @ColumnResult(name = "id",type = Integer.class),
                        @ColumnResult(name = "idKhachHang",type = Integer.class),
                        @ColumnResult(name = "idNhanVien",type = Integer.class),
                        @ColumnResult(name = "idPhuongThucThanhToan",type = Integer.class),
                        @ColumnResult(name = "idVoucher",type = Integer.class),
                        @ColumnResult(name = "tenKhachHang", type = String.class),
                        @ColumnResult(name = "tenNhanVien",type = String.class),
                        @ColumnResult(name = "tenVoucher",type = String.class),
                        @ColumnResult(name = "giaTriGiam",type = Double.class),
                        @ColumnResult(name = "hinhThucGiam",type = Boolean.class),
                        @ColumnResult(name = "maHoaDon",type = String.class),
                        @ColumnResult(name = "tenNguoiNhan",type = String.class),
                        @ColumnResult(name = "sdtNguoiNhan",type = String.class),
                        @ColumnResult(name = "diaChiNhanHang",type = String.class),
                        @ColumnResult(name = "phiVanChuyen",type = Double.class),
                        @ColumnResult(name = "tongTienTruocVoucher",type = Double.class),
                        @ColumnResult(name = "tongTienThanhToan",type = Double.class),
                        @ColumnResult(name = "ngayTao",type = LocalDate.class),
                        @ColumnResult(name = "ngaySua",type = LocalDate.class),
                        @ColumnResult(name = "trangThai",type = Integer.class),
                        @ColumnResult(name = "ghiChu",type = String.class),
                        @ColumnResult(name = "totalRecords",type = Integer.class),
                }
        )
)
@Entity
public class HoaDonResponse {
    @Id
    private Integer id;
    private Integer idKhachHang;
    private Integer idNhanVien;
    private Integer idPhuongThucThanhToan;
    private Integer idVoucher;
    private String tenKhachHang;
    private String tenNhanVien;
    private String tenVoucher;
    private Double giaTriGiam;
    private Boolean hinhThucGiam;
    private String tenPhuongThucThanhToan;
    private String maHoaDon;
    private String tenNguoiNhan;
    private String sdtNguoiNhan;
    private String diaChiNhanHang;
    private Double phiVanChuyen;
    private Double tongTienTruocVoucher;
    private Double tongTienThanhToan;
    @JsonFormat(shape = JsonFormat.Shape.STRING, pattern = "yyyy-MM-dd")
    private LocalDate ngayTao;
    @JsonFormat(shape = JsonFormat.Shape.STRING, pattern = "yyyy-MM-dd")
    private LocalDate ngaySua;
    private Integer trangThai;
    private String ghiChu;
    private Integer totalRecords;
}
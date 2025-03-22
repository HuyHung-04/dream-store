package com.example.dreambackend.responses;

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
        name = "HoaDonChiTietResponseMapping",
        classes = @ConstructorResult(
                targetClass = HoaDonChiTietResponse.class,
                columns = {
                        @ColumnResult(name = "id", type=Integer.class),
                        @ColumnResult(name = "idHoaDon", type=Integer.class),
                        @ColumnResult(name = "idSanPhamChiTiet", type=Integer.class),
                        @ColumnResult(name = "maSanPhamChiTiet", type=String.class),
                        @ColumnResult(name = "maHoaDon", type=String.class),
                        @ColumnResult(name = "tenMau", type=String.class),
                        @ColumnResult(name = "tenSize", type=String.class),
                        @ColumnResult(name = "maHoaDonChiTiet", type=String.class),
                        @ColumnResult(name = "tenSanPham", type=String.class),
                        @ColumnResult(name = "soLuong", type=Integer.class),
                        @ColumnResult(name = "gia", type=Double.class),
                        @ColumnResult(name = "ngayTao", type= LocalDate.class),
                        @ColumnResult(name = "ngaySua", type= LocalDate.class),
                        @ColumnResult(name = "trangThai", type = Integer.class),
                        @ColumnResult(name = "hinhThucGiam", type = Boolean.class),
                        @ColumnResult(name = "giaTriGiam", type = Double.class),
                        @ColumnResult(name = "tenNhanVien", type=String.class),
                        @ColumnResult(name = "tenKhachHang", type=String.class),
                        @ColumnResult(name = "tenVoucher", type=String.class),
                        @ColumnResult(name = "totalRecords", type = Integer.class)
                }
        )
)
@Entity
public class HoaDonChiTietResponse {
    @Id
    private Integer id;
    private Integer idHoaDon;
    private Integer idSanPhamChiTiet;
    private String maSanPhamChiTiet;
    private String ma;
    private String maHoaDon;
    private String tenMau;
    private String tenNhanVien;
    private String tenKhachHang;
    private String tenVoucher;
    private String tenSize;
    private String maHoaDonChiTiet;
    private String tenSanPham;
    private Integer soLuong;
    private Double gia;
    @JsonFormat(shape = JsonFormat.Shape.STRING, pattern = "yyyy-MM-dd")
    private LocalDate ngayTao;
    @JsonFormat(shape = JsonFormat.Shape.STRING, pattern = "yyyy-MM-dd")
    private LocalDate ngaySua;
    private Integer trangThai;
    private Boolean hinhThucGiam;
    private Double giaTriGiam;
    private Integer totalRecords;
}
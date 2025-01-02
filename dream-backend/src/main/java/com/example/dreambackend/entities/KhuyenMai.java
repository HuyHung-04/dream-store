package com.example.dreambackend.entities;

import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;
import java.util.Date;

@Builder
@Data
@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
@Entity
@Table(name = "khuyen_mai")
public class KhuyenMai {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @Column(name = "ma", nullable = false, unique = true, length = 50)
    private String ma;

    @Column(name = "ten", nullable = false, length = 100)
    private String ten;

    @Column(name = "hinh_thuc_giam", nullable = false)
    private boolean hinhThucGiam;
    @Column(name = "gia_tri_giam", nullable = false, precision = 10, scale = 2)
    private BigDecimal giaTriGiam;
    @Column(name = "trang_thai", nullable = false)
    private Integer trangThai;
    @Column(name = "ngay_tao")
    private Date ngayTao;

    @Column(name = "ngay_sua")
    private Date ngaySua;
    @Column(name = "ngay_bat_dau", nullable = false)
    private Date ngayBatDau;

    @Column(name = "ngay_ket_thuc", nullable = false)
    private Date ngayKetThuc;
}

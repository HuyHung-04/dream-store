package com.example.dreambackend.entities;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.util.Date;
import java.util.List;

@Entity
@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder
@Table(name = "gio_hang")
public class GioHang {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @Column(name = "so_luong")
    private int soLuong;

    @Column(name = "tong_gia")
    private int tongGia;

    @Column(name = "gia_sau_giam")
    private int giaSauGiam;

    @Column(name = "ngay_sua")
    private LocalDate ngaySua;

    @Column(name = "ngay_tao")
    private LocalDate ngayTao;

    @ManyToOne
    @JoinColumn(name = "id_san_pham_chi_tiet",referencedColumnName = "id")
    private SanPhamChiTiet sanPhamChiTiet;

    @ManyToOne
    @JoinColumn(name = "id_khach_hang",referencedColumnName = "id")
    private KhachHang khachHang;
}

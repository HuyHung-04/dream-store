package com.example.dreambackend.entities;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;

@Entity
@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder
@Table(name = "hoa_don_chi_tiet")
public class HoaDonChiTiet {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @Column(name = "so_luong")
    private int soLuong;

    @Column(name = "don_gia")
    private Float donGia;

    @Column(name = "ngay_sua")
    private LocalDate ngaySua;

    @Column(name = "ngay_tao")
    private LocalDate ngayTao;

    @Column(name = "trang_thai")
    private int trangThai;

    @ManyToOne
    @JoinColumn(name = "id_san_pham_chi_tiet",referencedColumnName = "id")
    private SanPhamChiTiet sanPhamChiTiet;

    @ManyToOne
    @JoinColumn(name="id_hoa_don",referencedColumnName = "id")
    private HoaDon hoaDon;
}

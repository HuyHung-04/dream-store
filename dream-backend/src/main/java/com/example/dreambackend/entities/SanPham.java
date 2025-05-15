package com.example.dreambackend.entities;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDate;
import java.util.List;

@Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Entity
    @Table(name = "san_pham")
    public class SanPham{
        @Id
        @Column(name = "id")
        @GeneratedValue(strategy = GenerationType.IDENTITY)
        private Integer id;

        @Column(name = "ma")
        private String ma;

        @Column(name = "ten")
        private String ten;

        @Column(name = "ngay_tao")
        private LocalDate ngayTao;

        @Column(name = "ngay_sua")
        private LocalDate ngaySua;

        @Column(name = "trang_thai")
        private int trangThai;

        @ManyToOne
        @JoinColumn(name = "id_chat_lieu", referencedColumnName = "id")
        private ChatLieu chatLieu;

        @ManyToOne
        @JoinColumn(name = "id_thuong_hieu", referencedColumnName = "id")
        private ThuongHieu thuongHieu;

        @ManyToOne
        @JoinColumn(name = "id_co_ao", referencedColumnName = "id")
        private CoAo coAo;

        @ManyToOne
        @JoinColumn(name = "id_xuat_xu", referencedColumnName = "id")
        private XuatXu xuatXu;

        @OneToMany(mappedBy = "sanPham", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
        private List<Anh> anhs;
    }

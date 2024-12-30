package org.example.dreambackend.entities;

import jakarta.persistence.*;
import lombok.*;

import java.util.Date;

@Data
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Entity
@Table(name = "san_pham_chi_tiet")
public class SanPhamChiTiet {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @Column(name = "so_luong")
    private int soLuong;

    @Column(name = "ngay_sua")
    private Date ngaySua;

    @Column(name = "ngay_tao")
    private Date ngayTao;

    @Column(name = "trang_thai")
    private int trangThai;

    @ManyToOne
    @JoinColumn(name = "id_san_pham",referencedColumnName = "id")
    private SanPham sanPham;
}

// Entity Class
package com.example.dreambackend.entities;


import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDate;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Entity
@Table(name = "nhan_vien")
public class NhanVien {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private int id;

    @Column(name = "id_vai_tro")
    private int idVaiTro;

    @Column(name = "ma", nullable = false, length = 10)
    private String ma;

    @Column(name = "ten", length = 30)
    private String ten;

    @Column(name = "gioi_tinh")
    private boolean gioiTinh;

    @Column(name = "ngay_sinh")
    private LocalDate ngaySinh;

    @Column(name = "email", length = 50)
    private String email;

    @Column(name = "so_dien_thoai", length = 15)
    private String soDienThoai;

    @Column(name = "tai_khoan", length = 30)
    private String taiKhoan;

    @Column(name = "mat_khau", length = 30)
    private String matKhau;

    @Column(name = "anh", length = 50)
    private String anh;

    @Column(name = "ngay_sua")
    private LocalDate ngaySua;

    @Column(name = "ngay_tao")
    private LocalDate ngayTao;

    @Column(name = "trang_thai")
    private int trangThai;

    // Getter và Setter Thủ Công (nếu Lombok không hoạt động)
    public int getId() { return id; }
    public void setId(int id) { this.id = id; }

    public int getIdVaiTro() { return idVaiTro; }
    public void setIdVaiTro(int idVaiTro) { this.idVaiTro = idVaiTro; }

    public String getMa() { return ma; }
    public void setMa(String ma) { this.ma = ma; }

    public String getTen() { return ten; }
    public void setTen(String ten) { this.ten = ten; }

    public boolean isGioiTinh() { return gioiTinh; }
    public void setGioiTinh(boolean gioiTinh) { this.gioiTinh = gioiTinh; }

    public LocalDate getNgaySinh() { return ngaySinh; }
    public void setNgaySinh(LocalDate ngaySinh) { this.ngaySinh = ngaySinh; }

    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }

    public String getSoDienThoai() { return soDienThoai; }
    public void setSoDienThoai(String soDienThoai) { this.soDienThoai = soDienThoai; }

    public String getTaiKhoan() { return taiKhoan; }
    public void setTaiKhoan(String taiKhoan) { this.taiKhoan = taiKhoan; }

    public String getMatKhau() { return matKhau; }
    public void setMatKhau(String matKhau) { this.matKhau = matKhau; }

    public String getAnh() { return anh; }
    public void setAnh(String anh) { this.anh = anh; }

    public LocalDate getNgaySua() { return ngaySua; }
    public void setNgaySua(LocalDate ngaySua) { this.ngaySua = ngaySua; }

    public LocalDate getNgayTao() { return ngayTao; }
    public void setNgayTao(LocalDate ngayTao) { this.ngayTao = ngayTao; }

    public int getTrangThai() { return trangThai; }
    public void setTrangThai(int trangThai) { this.trangThai = trangThai; }
}

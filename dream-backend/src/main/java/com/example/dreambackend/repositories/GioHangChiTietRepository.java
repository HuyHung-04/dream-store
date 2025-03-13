package com.example.dreambackend.repositories;

import com.example.dreambackend.entities.GioHangChiTiet;
import com.example.dreambackend.responses.GioHangChiTietResponse;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface GioHangChiTietRepository extends JpaRepository<GioHangChiTiet, Integer> {
    @Query("SELECT new com.example.dreambackend.responses.GioHangChiTietResponse(" +
            "g.id, " +
            "(SELECT a.anhUrl FROM Anh a WHERE a.sanPham = spct.sanPham AND a.trangThai = 1 ORDER BY a.ngayTao ASC LIMIT 1), " +
            "s.ten, spct.mauSac.ten, spct.size.ten, " +
            "g.soLuong, " +
            "CASE " +
            "   WHEN km.id IS NOT NULL THEN " +
            "       CASE " +
            "           WHEN km.hinhThucGiam = TRUE THEN CAST(g.soLuong * (spct.gia - km.giaTriGiam) AS double) " +
            "           ELSE CAST(g.soLuong * (spct.gia * (1 - km.giaTriGiam / 100.0)) AS double) " +
            "       END " +
            "   ELSE CAST(g.soLuong * spct.gia AS double) " +
            "END, " +
            "CASE WHEN km.hinhThucGiam IS NOT NULL AND km.hinhThucGiam = TRUE THEN TRUE ELSE FALSE END, " + // Ép kiểu Boolean
            "km.giaTriGiam, " +
            "g.trangThai, k.id, spct.id) " +
            "FROM GioHangChiTiet g " +
            "JOIN g.khachHang k " +
            "JOIN g.sanPhamChiTiet spct " +
            "JOIN spct.sanPham s " +
            "LEFT JOIN spct.khuyenMai km ON km.trangThai = 1 " +
            "WHERE k.id = :idKhachHang")
    List<GioHangChiTietResponse> findGioHangChiTietByKhachHangId(@Param("idKhachHang") Integer idKhachHang);


    Optional<GioHangChiTiet> findByKhachHangIdAndSanPhamChiTietId(Integer idKhachHang, Integer idSanPhamChiTiet);

    @Query("SELECT new com.example.dreambackend.responses.GioHangChiTietResponse(" +
            "g.id, " +
            "(SELECT a.anhUrl FROM Anh a WHERE a.sanPham = spct.sanPham AND a.trangThai = 1 ORDER BY a.ngayTao ASC LIMIT 1), " +
            "s.ten, spct.mauSac.ten, spct.size.ten, " +
            "g.soLuong, " +
            "CASE " +
            "   WHEN km.id IS NOT NULL THEN " +
            "       CASE " +
            "           WHEN km.hinhThucGiam = TRUE THEN CAST(g.soLuong * (spct.gia - km.giaTriGiam) AS double) " +
            "           ELSE CAST(g.soLuong * (spct.gia * (1 - km.giaTriGiam / 100.0)) AS double) " +
            "       END " +
            "   ELSE CAST(g.soLuong * spct.gia AS double) " +
            "END, " +
            "CASE WHEN km.hinhThucGiam IS NOT NULL AND km.hinhThucGiam = TRUE THEN TRUE ELSE FALSE END, " + // Ép kiểu Boolean
            "km.giaTriGiam, " +
            "g.trangThai, k.id, spct.id) " +
            "FROM GioHangChiTiet g " +
            "JOIN g.khachHang k " +
            "JOIN g.sanPhamChiTiet spct " +
            "JOIN spct.sanPham s " +
            "LEFT JOIN spct.khuyenMai km ON km.trangThai = 1 " +
            "WHERE k.id = :idKhachHang AND g.trangThai=0")
    List<GioHangChiTietResponse> findGioHangChiTietByStatus(@Param("idKhachHang") Integer idKhachHang);




}








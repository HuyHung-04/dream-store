package com.example.dreambackend.repositories;

import com.example.dreambackend.entities.GioHangChiTiet;
import com.example.dreambackend.entities.KhachHang;
import com.example.dreambackend.entities.SanPhamChiTiet;
import com.example.dreambackend.responses.GioHangChiTietResponse;
import jakarta.transaction.Transactional;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
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
            "   WHEN km.id IS NOT NULL AND km.trangThai = 1 AND km.ngayBatDau <= CURRENT_DATE AND km.ngayKetThuc >= CURRENT_DATE " +
            "   THEN CAST((spct.gia * (1 - km.giaTriGiam / 100.0)) AS double) " +
            "   ELSE CAST(spct.gia AS double) " +
            "END, " +
            "CASE " +
            "   WHEN km.id IS NOT NULL AND km.trangThai = 1 AND km.ngayBatDau <= CURRENT_DATE AND km.ngayKetThuc >= CURRENT_DATE " +
            "   THEN km.giaTriGiam " +
            "   ELSE 0 " +
            "END, " +
            "g.trangThai, k.id, spct.id) " +
            "FROM GioHangChiTiet g " +
            "JOIN g.khachHang k " +
            "JOIN g.sanPhamChiTiet spct " +
            "JOIN spct.sanPham s " +
            "LEFT JOIN spct.khuyenMai km ON km.trangThai = 1 " +
            "WHERE k.id = :idKhachHang AND g.trangThai = 1")
    List<GioHangChiTietResponse> findGioHangChiTietByKhachHangId(@Param("idKhachHang") Integer idKhachHang);



    @Query("SELECT new com.example.dreambackend.responses.GioHangChiTietResponse(" +
            "g.id, " +
            "(SELECT a.anhUrl FROM Anh a WHERE a.sanPham = spct.sanPham AND a.trangThai = 1 ORDER BY a.ngayTao ASC LIMIT 1), " +
            "s.ten, spct.mauSac.ten, spct.size.ten, " +
            "g.soLuong, " +
            "CASE " +
            "   WHEN km.id IS NOT NULL AND km.trangThai = 1 AND km.ngayBatDau <= CURRENT_DATE AND km.ngayKetThuc >= CURRENT_DATE " +
            "   THEN CAST((spct.gia * (1 - km.giaTriGiam / 100.0)) AS double) " +
            "   ELSE CAST(spct.gia AS double) " +
            "END, " +
            "CASE " +
            "   WHEN km.id IS NOT NULL AND km.trangThai = 1 AND km.ngayBatDau <= CURRENT_DATE AND km.ngayKetThuc >= CURRENT_DATE " +
            "   THEN km.giaTriGiam " +
            "   ELSE 0 " +
            "END, " +
            "g.trangThai, k.id, spct.id) " +
            "FROM GioHangChiTiet g " +
            "JOIN g.khachHang k " +
            "JOIN g.sanPhamChiTiet spct " +
            "JOIN spct.sanPham s " +
            "LEFT JOIN spct.khuyenMai km ON km.trangThai = 1 " +
            "WHERE k.id = :idKhachHang AND g.trangThai = 2")
    List<GioHangChiTietResponse> findGioHangChiTietByStatus(@Param("idKhachHang") Integer idKhachHang);


    @Transactional
    @Modifying
    @Query("DELETE FROM GioHangChiTiet g WHERE g.khachHang.id = :khachHangId AND g.trangThai = :trangThai")
    void deleteByKhachHangIdAndTrangThai(@Param("khachHangId") Integer khachHangId, @Param("trangThai") int trangThai);



    @Modifying
    @Transactional
    @Query("DELETE FROM GioHangChiTiet g WHERE g.khachHang.id = :khachHangId AND g.trangThai = 2")
    int deleteByKhachHangIdAndTrangThai2(@Param("khachHangId") Integer khachHangId);


    @Query("SELECT g FROM GioHangChiTiet g WHERE g.khachHang.id = :khachHangId AND g.sanPhamChiTiet.id = :sanPhamChiTietId AND g.trangThai = 1")
    Optional<GioHangChiTiet> findByKhachHangIdAndSanPhamChiTietIdAndTrangThai(@Param("khachHangId") Integer khachHangId,
                                                                              @Param("sanPhamChiTietId") Integer sanPhamChiTietId);

    @Query("SELECT g FROM GioHangChiTiet g WHERE g.khachHang.id = :khachHangId AND g.sanPhamChiTiet.id = :sanPhamChiTietId AND g.trangThai = :trangThai")
    Optional<GioHangChiTiet> findByKhachHangIdAndSanPhamChiTietIdAndGioHang(@Param("khachHangId") Integer khachHangId,
                                                                            @Param("sanPhamChiTietId") Integer sanPhamChiTietId,
                                                                            @Param("trangThai") Integer trangThai);
    // Tìm tất cả chi tiết giỏ hàng theo sản phẩm chi tiết (dựa trên id Integer)
    List<GioHangChiTiet> findAllBySanPhamChiTietId(Integer sanPhamChiTietId);

    // Phương thức xóa tất cả các giỏ hàng chi tiết dựa trên danh sách ID (kiểu Integer)
    @Modifying
    @Transactional
    void deleteAllByIdIn(List<Integer> ids);// Tìm tất cả chi tiết giỏ hàng theo sản phẩm chi tiết (dựa trên id Integer)

    List<GioHangChiTiet> findByKhachHangIdAndTrangThai(Integer idKhachHang, Integer trangThai);

    @Modifying
    @Transactional
    void deleteByKhachHangIdAndSanPhamChiTietIdAndTrangThai(Integer khachHangId, Integer sanPhamChiTietId, Integer trangThai);
}








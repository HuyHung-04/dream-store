package com.example.dreambackend.repositories;

import com.example.dreambackend.dtos.SanPhamChiTietOnlineDto;
import com.example.dreambackend.entities.KhachHang;
import com.example.dreambackend.entities.SanPhamChiTiet;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface SanPhamChiTietOnlineRepository extends JpaRepository<SanPhamChiTiet, Integer> {
    @Query("SELECT new com.example.dreambackend.dtos.SanPhamChiTietOnlineDto( " +
            "spct.id, sp.ten, a.anhUrl, spct.gia, cl.ten, ca.ten, th.ten, xx.ten, " +
            "ms.ten, s.ten, spct.soLuong, COALESCE(ghct.soLuong, 0), " +
            "COALESCE(km.hinhThucGiam, false), " +
            "COALESCE(CAST(km.giaTriGiam AS BigDecimal), CAST(0.00 AS BigDecimal))) " +
            "FROM SanPhamChiTiet spct " +
            "JOIN spct.sanPham sp " +
            "JOIN Anh a ON sp.id = a.sanPham.id " +
            "JOIN ChatLieu cl ON sp.chatLieu.id = cl.id " +
            "JOIN CoAo ca ON sp.coAo.id = ca.id " +
            "JOIN ThuongHieu th ON sp.thuongHieu.id = th.id " +
            "JOIN XuatXu xx ON sp.xuatXu.id = xx.id " +
            "JOIN MauSac ms ON spct.mauSac.id = ms.id " +
            "JOIN Size s ON spct.size.id = s.id " +
            "LEFT JOIN GioHangChiTiet ghct ON spct.id = ghct.sanPhamChiTiet.id " +
            "LEFT JOIN KhuyenMai km ON spct.khuyenMai.id = km.id " +
            "WHERE sp.trangThai = 1 AND sp.id = :idSanPham " +
            "ORDER BY a.id ASC")
    List<SanPhamChiTietOnlineDto> getSanPhamChiTiet(@Param("idSanPham") Integer idSanPham);

    @Query("SELECT new com.example.dreambackend.dtos.SanPhamChiTietOnlineDto( " +
            "spct.id, sp.ten, a.anhUrl, spct.gia, cl.ten, ca.ten, th.ten, xx.ten, " +
            "ms.ten, s.ten, spct.soLuong, COALESCE(ghct.soLuong, 0), " +
            "COALESCE(km.hinhThucGiam, false), " +
            "COALESCE(CAST(km.giaTriGiam AS BigDecimal), CAST(0.00 AS BigDecimal))) " +
            "FROM SanPhamChiTiet spct " +
            "JOIN spct.sanPham sp " +
            "JOIN Anh a ON sp.id = a.sanPham.id " +
            "JOIN ChatLieu cl ON sp.chatLieu.id = cl.id " +
            "JOIN CoAo ca ON sp.coAo.id = ca.id " +
            "JOIN ThuongHieu th ON sp.thuongHieu.id = th.id " +
            "JOIN XuatXu xx ON sp.xuatXu.id = xx.id " +
            "JOIN MauSac ms ON spct.mauSac.id = ms.id " +
            "JOIN Size s ON spct.size.id = s.id " +
            "LEFT JOIN GioHangChiTiet ghct ON spct.id = ghct.sanPhamChiTiet.id " +
            "LEFT JOIN KhuyenMai km ON spct.khuyenMai.id = km.id " +
            "WHERE sp.trangThai = 1 AND LOWER(sp.ten) LIKE LOWER(CONCAT('%', :tenSanPham, '%')) " +
            "ORDER BY a.id ASC")
    List<SanPhamChiTietOnlineDto> getSanPhamChiTietByTen(@Param("tenSanPham") String tenSanPham);

}





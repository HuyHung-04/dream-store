package com.example.dreambackend.repositories;

import com.example.dreambackend.dtos.SanPhamDto;
import com.example.dreambackend.entities.SanPham;
import com.example.dreambackend.entities.SanPhamChiTiet;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
@Repository
public interface SanPhamOnlineRepository extends JpaRepository<SanPham, Integer> {
    @Query("SELECT new com.example.dreambackend.dtos.SanPhamDto(sp.id, sp.ten, " +
            "(SELECT MIN(spct.gia) FROM SanPhamChiTiet spct WHERE spct.sanPham.id = sp.id AND spct.trangThai = 1), " +
            "(SELECT a.anhUrl FROM Anh a WHERE a.sanPham.id = sp.id ORDER BY a.id ASC LIMIT 1)) " +
            "FROM SanPham sp " +
            "WHERE sp.trangThai = 1 " +
            "AND EXISTS (SELECT 1 FROM Anh a WHERE a.sanPham.id = sp.id) " +
            "AND EXISTS (SELECT 1 FROM SanPhamChiTiet spct WHERE spct.sanPham.id = sp.id AND spct.trangThai = 1 AND spct.soLuong > 0)")
    Page<SanPhamDto> getSanPhamChiTietOnline(Pageable pageable);
    @Query("SELECT new com.example.dreambackend.dtos.SanPhamDto(sp.id, sp.ten, " +
            "(SELECT MIN(spct.gia) FROM SanPhamChiTiet spct WHERE spct.sanPham.id = sp.id), " +
            "(SELECT a.anhUrl FROM Anh a WHERE a.sanPham.id = sp.id ORDER BY a.id ASC LIMIT 1)) " +
            "FROM SanPham sp " +
            "WHERE sp.trangThai = 1 " +
            "AND sp.ten LIKE %:name% " +
            "AND EXISTS (SELECT 1 FROM Anh a WHERE a.sanPham.id = sp.id) " +
            "AND EXISTS (SELECT 1 FROM SanPhamChiTiet spct WHERE spct.sanPham.id = sp.id)")
    Page<SanPhamDto> searchSanPhamByName(@Param("name") String name, Pageable pageable);

    // lọc thương hiệu tìm theo giá
    @Query("SELECT new com.example.dreambackend.dtos.SanPhamDto(sp.id, sp.ten, " +
            "(SELECT MIN(spct.gia) FROM SanPhamChiTiet spct WHERE spct.sanPham.id = sp.id), " +
            "(SELECT a.anhUrl FROM Anh a WHERE a.sanPham.id = sp.id ORDER BY a.id ASC LIMIT 1)) " +
            "FROM SanPham sp " +
            "LEFT JOIN sp.thuongHieu th " +
            "WHERE sp.trangThai = 1 " +
            "AND (:thuongHieu IS NULL OR th.ten = :thuongHieu) " +
            "AND (:minGia IS NULL OR EXISTS (SELECT 1 FROM SanPhamChiTiet spct WHERE spct.sanPham.id = sp.id AND spct.gia >= :minGia)) " +
            "AND (:maxGia IS NULL OR EXISTS (SELECT 1 FROM SanPhamChiTiet spct WHERE spct.sanPham.id = sp.id AND spct.gia <= :maxGia)) " +
            "AND EXISTS (SELECT 1 FROM Anh a WHERE a.sanPham.id = sp.id)")
    Page<SanPhamDto> searchSanPham(@Param("thuongHieu") String thuongHieu,
                                   @Param("minGia") Double minGia,
                                   @Param("maxGia") Double maxGia,
                                   Pageable pageable);
}


package com.example.dreambackend.repositories;

import com.example.dreambackend.entities.HoaDon;
import com.example.dreambackend.entities.SanPhamChiTiet;
import com.example.dreambackend.responses.TopSanPhamResponse;
import com.example.dreambackend.entities.HoaDonChiTiet;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.CrudRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

@Repository
public interface HoaDonChiTietRepository extends CrudRepository<HoaDonChiTiet, Integer> {

    // Top sản phẩm bán chạy nhất trong ngày hôm nay
    @Query("SELECT new com.example.dreambackend.responses.TopSanPhamResponse(sp.ten, SUM(hdct.soLuong)) " +
            "FROM HoaDonChiTiet hdct " +
            "JOIN hdct.sanPhamChiTiet spct " +
            "JOIN spct.sanPham sp " +
            "WHERE hdct.ngayTao = CURRENT_DATE " +
            "GROUP BY sp.ten " +
            "ORDER BY SUM(hdct.soLuong) DESC")
    Page<TopSanPhamResponse> getTopSanPhamHomNay(Pageable pageable);

    // Top sản phẩm bán chạy nhất trong tháng này
    @Query("SELECT new com.example.dreambackend.responses.TopSanPhamResponse(sp.ten, SUM(hdct.soLuong)) " +
            "FROM HoaDonChiTiet hdct " +
            "JOIN hdct.sanPhamChiTiet spct " +
            "JOIN spct.sanPham sp " +
            "WHERE hdct.ngayTao BETWEEN :startDate AND :endDate " +
            "GROUP BY sp.ten " +
            "ORDER BY SUM(hdct.soLuong) DESC")
    Page<TopSanPhamResponse> getTopSanPhamThangNay(Pageable pageable, LocalDate startDate, LocalDate endDate);

    // Top sản phẩm bán chạy nhất trong năm nay
    @Query("SELECT new com.example.dreambackend.responses.TopSanPhamResponse(sp.ten, SUM(hdct.soLuong)) " +
            "FROM HoaDonChiTiet hdct " +
            "JOIN hdct.sanPhamChiTiet spct " +
            "JOIN spct.sanPham sp " +
            "WHERE YEAR(hdct.ngayTao) = YEAR(CURRENT_DATE) " +
            "GROUP BY sp.ten " +
            "ORDER BY SUM(hdct.soLuong) DESC")
    Page<TopSanPhamResponse> getTopSanPhamNamNay(Pageable pageable);

    // Top sản phẩm bán chạy nhất tất cả thời gian
    @Query("SELECT new com.example.dreambackend.responses.TopSanPhamResponse(sp.ten, SUM(hdct.soLuong)) " +
            "FROM HoaDonChiTiet hdct " +
            "JOIN hdct.sanPhamChiTiet spct " +
            "JOIN spct.sanPham sp " +
            "GROUP BY sp.ten " +
            "ORDER BY SUM(hdct.soLuong) DESC")
    Page<TopSanPhamResponse> getTopSanPhamTatCa(Pageable pageable);
    List<HoaDonChiTiet> findByHoaDonId(int id);

    Optional<HoaDonChiTiet> findByHoaDonAndSanPhamChiTiet(HoaDon hoaDon, SanPhamChiTiet sanPhamChiTiet);

    List<HoaDonChiTiet> findByHoaDon(HoaDon hoaDon);

    Optional<HoaDonChiTiet> findBySanPhamChiTietId(Integer idSanPhamChiTiet);

}

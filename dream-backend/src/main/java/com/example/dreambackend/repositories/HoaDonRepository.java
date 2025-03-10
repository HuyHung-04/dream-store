package com.example.dreambackend.repositories;

import com.example.dreambackend.entities.HoaDon;
import com.example.dreambackend.responses.*;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.CrudRepository;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

@Repository
public interface HoaDonRepository extends CrudRepository<HoaDon, Integer> {

    @Query("SELECT new com.example.dreambackend.responses.ThongKeResponse(COUNT(h.id), SUM(h.tongTienThanhToan), COUNT(DISTINCT h.khachHang.id)) " +
            "FROM HoaDon h " +
            "WHERE (:startDate IS NULL OR h.ngayNhanDuKien >= :startDate) AND (:endDate IS NULL OR h.ngayNhanDuKien <= :endDate)")
    ThongKeResponse getTongQuan(LocalDate startDate, LocalDate endDate);

    @Query("SELECT new com.example.dreambackend.responses.ThongKeThangResponse(MONTH(h.ngayNhanDuKien), SUM(h.tongTienThanhToan)) " +
            "FROM HoaDon h " +
            "WHERE YEAR(h.ngayNhanDuKien) = YEAR(CURRENT_DATE) " +
            "GROUP BY MONTH(h.ngayNhanDuKien) " +
            "ORDER BY MONTH(h.ngayNhanDuKien)")
    List<ThongKeThangResponse> getDoanhThuTungThang();
    @Query("SELECT YEAR(h.ngayNhanDuKien) AS year, SUM(h.tongTienThanhToan) AS totalRevenue " +
            "FROM HoaDon h " +
            "GROUP BY YEAR(h.ngayNhanDuKien) " +
            "ORDER BY YEAR(h.ngayNhanDuKien)")
    List<Object[]> getDoanhThuTungNam();
    @Query("SELECT new com.example.dreambackend.responses.ThongKeThangNayResponse(" +
            "DAY(h.ngayNhanDuKien), SUM(h.tongTienThanhToan)) " +
            "FROM HoaDon h " +
            "WHERE MONTH(h.ngayNhanDuKien) = MONTH(CURRENT_DATE) " +
            "AND YEAR(h.ngayNhanDuKien) = YEAR(CURRENT_DATE) " +
            "GROUP BY DAY(h.ngayNhanDuKien) " +
            "ORDER BY DAY(h.ngayNhanDuKien)")
    List<ThongKeThangNayResponse> getDoanhThuTungNgayTrongThang();
    // Truy vấn doanh thu hôm nay
    @Query("SELECT new com.example.dreambackend.responses.ThongKeHomNayResponse(" +
            "COUNT(DISTINCT h.khachHang.id), SUM(h.tongTienThanhToan), COUNT(DISTINCT h.khachHang.id)) " +
            "FROM HoaDon h " +
            "WHERE h.ngayNhanDuKien = CURRENT_DATE")
    ThongKeHomNayResponse getDoanhThuHomNay();
    List<HoaDon> findAllByTrangThai(int i);

    Optional<HoaDon> findByMa(String ma);

}

package com.example.dreambackend.repository;

import com.example.dreambackend.entities.HoaDon;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDate;
import java.util.List;


public interface HoaDonRepository extends JpaRepository<HoaDon, Integer> {
    List<HoaDon> findHoaDonByKhachHang_Id(Integer khachHangId);
    @Query("""
            SELECT h FROM HoaDon h
            WHERE (:search1 IS NULL OR h.tenNguoiNhan LIKE %:search1%)
            AND (:search2 IS NULL OR h.diaChiNhanHang LIKE %:search2%)
            AND (:combo1 IS NULL OR h.hinhThucThanhToan = :combo1)
            AND (:combo2 IS NULL OR h.trangThai = :combo2)
            AND (:fromDate IS NULL OR h.ngayTao >= :fromDate)
            AND (:toDate IS NULL OR h.ngayTao <= :toDate)""")
                List<HoaDon> findFilteredData(
                        @Param("search1") String search1,
                        @Param("search2") String search2,
                        @Param("combo1") String combo1,
                        @Param("combo2") String combo2,
                        @Param("fromDate") LocalDate fromDate,
                        @Param("toDate")LocalDate toDate);
}



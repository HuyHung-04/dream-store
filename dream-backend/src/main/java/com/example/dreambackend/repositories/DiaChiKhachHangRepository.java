package com.example.dreambackend.repositories;

import com.example.dreambackend.entities.DiaChiKhachHang;
import com.example.dreambackend.responses.DiaChiKhachHangRespone;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface DiaChiKhachHangRepository extends JpaRepository<DiaChiKhachHang, Integer> {
    @Query("""
        SELECT dckh FROM DiaChiKhachHang dckh 
        WHERE dckh.khachHang.id = :idKhachHang
    """)
    List<DiaChiKhachHang> getAllDiaChiKhachHang(@Param("idKhachHang") Integer idKhachHang);

    @Query("SELECT dckh.id FROM DiaChiKhachHang dckh WHERE dckh.sdtNguoiNhan = :sdtNguoiNhan")
    Integer findIdBySdtNguoiNhan(@Param("sdtNguoiNhan") String sdtNguoiNhan);
}

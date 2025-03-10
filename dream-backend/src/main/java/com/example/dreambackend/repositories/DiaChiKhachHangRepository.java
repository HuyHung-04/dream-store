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
    select new com.example.dreambackend.responses.DiaChiKhachHangRespone(
        dckh.id,
        dckh.thon,
        dckh.phuongXa,
        dckh.quanHuyen,
        dckh.tinhThanhPho,
        dckh.moTa,
        dckh.ngayTao,
        dckh.ngaySua,
        dckh.trangThai,
        kh.id,
        kh.ten,
        kh.soDienThoai
        ) 
    from KhachHang kh 
    left join DiaChiKhachHang dckh on kh.id = dckh.khachHang.id
    where kh.id = :idKhachHang
    """)
    List<DiaChiKhachHangRespone> getAllDiaChiKhachHang(@Param("idKhachHang") Integer idKhachHang);

}

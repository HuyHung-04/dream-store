package com.example.dreambackend.repositories;

import com.example.dreambackend.entities.KhachHang;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface KhachHangRepository extends JpaRepository<KhachHang, Integer> {

    KhachHang findKhachHangByEmail(String email);

    Optional<KhachHang> findBySoDienThoai(String soDienThoai);// tìm khách hàng theo số điện thoại
    @Query("SELECT k FROM KhachHang k " +
            "WHERE (:trangThai = 3 OR k.trangThai = :trangThai) " +
            "AND (:ten IS NULL OR :ten = '' OR LOWER(k.ten) LIKE LOWER(CONCAT('%', :ten, '%'))) " +
            "AND k.id >= 2")
    Page<KhachHang> findByTrangThaiAndTenContainingIgnoreCase(
            @Param("trangThai") int trangThai,
            @Param("ten") String ten,
            Pageable pageable
    );


    @Query("SELECT k FROM KhachHang k WHERE k.soDienThoai != '' ")
    Page<KhachHang> findKhachHang(Pageable pageable);
}
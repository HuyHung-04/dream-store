package com.example.dreambackend.repositories;

import com.example.dreambackend.entities.KhuyenMai;
import com.example.dreambackend.entities.Voucher;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface KhuyenMaiRepository extends JpaRepository<KhuyenMai, Integer> {
    @Query("SELECT k FROM KhuyenMai k " +
            "WHERE (:trangThai = 3 OR k.trangThai = :trangThai) " +
            "AND (:ten IS NULL OR :ten = '' OR LOWER(k.ten) LIKE LOWER(CONCAT('%', :ten, '%')))")
    Page<KhuyenMai> findByTrangThaiAndTenContainingIgnoreCase(
            @Param("trangThai") int trangThai,
            @Param("ten") String ten,
            Pageable pageable
    );
}

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
    List<KhuyenMai> findByTenContainingIgnoreCase(String ten);
    @Query("SELECT k FROM KhuyenMai k WHERE k.trangThai = :trangThai")
    Page<KhuyenMai> findKhuyenMaiByTrangThai(@Param("trangThai") int trangThai, Pageable pageable);
}

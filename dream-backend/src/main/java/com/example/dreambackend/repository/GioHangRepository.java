package com.example.dreambackend.repository;

import com.example.dreambackend.entities.GioHang;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface GioHangRepository extends JpaRepository<GioHang, Integer> {
    List<GioHang> findGioHangsByKhachHang_Id(Integer khachHangId);
}

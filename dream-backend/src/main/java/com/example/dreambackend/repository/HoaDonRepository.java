package com.example.dreambackend.repository;

import com.example.dreambackend.entities.HoaDon;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;


public interface HoaDonRepository extends JpaRepository<HoaDon, Integer> {
    List<HoaDon> findHoaDonByKhachHang_Id(Integer khachHangId);
}

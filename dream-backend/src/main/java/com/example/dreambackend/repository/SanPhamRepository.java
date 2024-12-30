package com.example.dreambackend.repository;

import com.example.dreambackend.entities.SanPham;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

public interface SanPhamRepository extends JpaRepository<SanPham, Integer> {
}

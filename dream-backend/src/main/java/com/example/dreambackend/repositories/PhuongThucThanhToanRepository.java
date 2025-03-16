package com.example.dreambackend.repositories;

import com.example.dreambackend.dtos.PhuongThucThanhToanDto;
import com.example.dreambackend.entities.PhuongThucThanhToan;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.util.List;

public interface PhuongThucThanhToanRepository extends JpaRepository<PhuongThucThanhToan, Integer> {

    // JPQL query to select only id and ten
    @Query("SELECT new com.example.dreambackend.dtos.PhuongThucThanhToanDto(p.id, p.ten) FROM PhuongThucThanhToan p")
    List<PhuongThucThanhToanDto> findIdAndTen();
}

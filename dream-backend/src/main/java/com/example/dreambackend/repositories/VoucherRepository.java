package com.example.dreambackend.repositories;

import com.example.dreambackend.dtos.VoucherDto;
import com.example.dreambackend.entities.Voucher;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface VoucherRepository extends JpaRepository<Voucher,Integer> {
    @Query("SELECT new com.example.dreambackend.dtos.VoucherDto(v.id, v.ten, v.giamToiDa, v.hinhThucGiam, v.giaTriGiam) " +
            "FROM Voucher v WHERE v.trangThai = 1 AND v.soLuong > 0 AND v.ngayBatDau <= CURRENT_TIMESTAMP "
    )
    List<VoucherDto> findIdAndTen();


    @Query("SELECT v FROM Voucher v " +
            "WHERE (:trangThai = 3 OR v.trangThai = :trangThai) " +
            "AND (:ten IS NULL OR :ten = '' OR LOWER(v.ten) LIKE LOWER(CONCAT('%', :ten, '%')))")
    Page<Voucher> findByTrangThaiAndTenContainingIgnoreCase(
            @Param("trangThai") int trangThai,
            @Param("ten") String ten,
            Pageable pageable
    );
}


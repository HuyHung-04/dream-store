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
    List<Voucher> findByTenContainingIgnoreCase(String ten);
    @Query("SELECT new com.example.dreambackend.dtos.VoucherDto(v.id, v.ten, v.giamToiDa, v.hinhThucGiam, v.giaTriGiam) " +
            "FROM Voucher v WHERE v.trangThai = 1")
    List<VoucherDto> findIdAndTen();

    @Query("SELECT v FROM Voucher v WHERE v.trangThai = :trangThai")
    Page<Voucher> findVoucherByTrangThai(@Param("trangThai") int trangThai, Pageable pageable);
}


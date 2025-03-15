package com.example.dreambackend.repositories;

import com.example.dreambackend.dtos.VoucherDto;
import com.example.dreambackend.entities.Voucher;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface VoucherRepository extends JpaRepository<Voucher,Integer> {
    List<Voucher> findByTenContainingIgnoreCase(String ten);
    @Query("SELECT new com.example.dreambackend.dtos.VoucherDto(v.id, v.ten,v.giamToiDa) FROM Voucher v")
    List<VoucherDto> findIdAndTen();
}


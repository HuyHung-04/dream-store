package com.example.dreambackend.repositories;

import com.example.dreambackend.entities.NhanVien;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.Optional;

@Repository
public interface NhanVienRepository extends JpaRepository<NhanVien, Integer> {
    List<NhanVien> findByTenContainingIgnoreCase(String ten);
    Optional<NhanVien> findByEmail(String email);
    Page<NhanVien> findByTrangThai(Integer trangThai, Pageable pageable);
    boolean existsByMa(String ma);

    Optional<NhanVien> findByTaiKhoan(String taiKhoan);
    Boolean existsByTaiKhoan(String taiKhoan);
    Boolean existsByEmail(String email);
}

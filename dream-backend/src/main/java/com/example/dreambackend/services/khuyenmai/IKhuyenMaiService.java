package com.example.dreambackend.services.khuyenmai;

import com.example.dreambackend.dtos.SanPhamChiTietDto;
import com.example.dreambackend.entities.KhuyenMai;
import org.springframework.data.domain.Page;

import java.util.List;

public interface IKhuyenMaiService {
    Page<KhuyenMai> getAllKhuyenMaiPaged(int page, int size);
    KhuyenMai addKhuyenMai(KhuyenMai khuyenMai);
    KhuyenMai updateKhuyenMai(KhuyenMai khuyenMai);
    KhuyenMai getKhuyenMaiById(Integer id);
    List<KhuyenMai> searchKhuyenMaiByName(String ten);
    List<SanPhamChiTietDto> findAvailableProducts(String tenSanPham, Integer khuyenMaiId);
    void updateKhuyenMaiProducts(Integer khuyenMaiId, List<Integer> productIds);
    Page<KhuyenMai> getAllKhuyenMaiByTrangThai(int trangThai, int page, int size);

}

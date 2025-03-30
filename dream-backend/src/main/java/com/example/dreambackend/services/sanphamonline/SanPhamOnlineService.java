package com.example.dreambackend.services.sanphamonline;

import com.example.dreambackend.dtos.SanPhamChiTietDto;
import com.example.dreambackend.dtos.SanPhamChiTietOnlineDto;
import com.example.dreambackend.dtos.SanPhamDto;
import com.example.dreambackend.repositories.SanPhamChiTietOnlineRepository;
import com.example.dreambackend.repositories.SanPhamOnlineRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

import java.util.List;
@Service
public class SanPhamOnlineService implements ISanPhamOnlineService {
    @Autowired
    SanPhamOnlineRepository sanPhamOnlineRepository;

    @Autowired
    SanPhamChiTietOnlineRepository sanPhamChiTietOnlineRepository;
    @Override
    public Page<SanPhamDto> getSanPhamOnline(Pageable pageable) {
        return sanPhamOnlineRepository.getSanPhamChiTietOnline(pageable);
    }

    @Override
    public List<SanPhamChiTietOnlineDto> getSanPhamChiTiet(Integer idSanPham) {
        return sanPhamChiTietOnlineRepository.getSanPhamChiTiet(idSanPham);
    }

    @Override
    // Phương thức tìm kiếm sản phẩm theo tên và trạng thái = 1 (đang bán)
    public Page<SanPhamDto> searchSanPhamByNameAndTrangThai(String name, Pageable pageable) {
        return sanPhamOnlineRepository.searchSanPhamByName(name, pageable);
    }

    public Page<SanPhamDto> searchSanPham(String thuongHieu, Double minGia, Double maxGia, Pageable pageable) {
        return sanPhamOnlineRepository.searchSanPham(thuongHieu, minGia, maxGia, pageable);
    }

}

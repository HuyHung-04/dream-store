package com.example.dreambackend.services.sanphamonline;

import com.example.dreambackend.dtos.SanPhamChiTietDto;
import com.example.dreambackend.dtos.SanPhamChiTietOnlineDto;
import com.example.dreambackend.dtos.SanPhamDto;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.util.List;

public interface ISanPhamOnlineService {
    Page<SanPhamDto> getSanPhamOnline(Pageable pageable);

    List<SanPhamChiTietOnlineDto> getSanPhamChiTiet(Integer idSanPham);
    Page<SanPhamDto> searchSanPhamByNameAndTrangThai(String name, Pageable pageable);
    List<SanPhamChiTietOnlineDto> searchSanPhamChiTietByName(String tenSanPham);
}

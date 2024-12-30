package com.example.dreambackend.services.sanphamchitiet;

import com.example.dreambackend.dtos.SanPhamChiTietDTO;
import com.example.dreambackend.entities.SanPhamChiTiet;

import java.util.List;

public interface ISanPhamChiTietService {
    List<SanPhamChiTiet> getAllSanPhamChiTiet();
}

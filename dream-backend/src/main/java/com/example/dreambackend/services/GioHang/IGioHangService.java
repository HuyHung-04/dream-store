package com.example.dreambackend.services.GioHang;

import com.example.dreambackend.dtos.GioHangDTO;
import com.example.dreambackend.entities.GioHang;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.util.List;


public interface IGioHangService {
    GioHang createGioHang(GioHangDTO gioHangDTO);
    GioHang updateGioHang(int id,GioHangDTO gioHangDTO);
    List<GioHang> getGioHangByIdKhachHang(int id);
    void deleteGioHangByIdKhachHang(int id);
    Page<GioHang> getAllGioHang(Pageable pageable);
}

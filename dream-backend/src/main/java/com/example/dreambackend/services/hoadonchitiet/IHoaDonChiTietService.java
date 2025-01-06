package com.example.dreambackend.services.hoadonchitiet;

import com.example.dreambackend.dtos.HoaDonChiTietDTO;
import com.example.dreambackend.entities.HoaDonChiTiet;

import java.util.List;

public interface IHoaDonChiTietService {
    List<HoaDonChiTiet> getAllHoaDonChiTiet();
    HoaDonChiTiet getHoaDonChiTietById(int id);
    HoaDonChiTiet createHoaDonChiTiet(HoaDonChiTietDTO hoaDonChiTietDTO);
    HoaDonChiTiet updateHoaDonChiTiet(int id, HoaDonChiTietDTO newHoaDonChiTietDTO);
    List<HoaDonChiTiet> getHoaDonChiTietByHoaDonId(int id);
}

package com.example.dreambackend.services.hoadon;

import com.example.dreambackend.dtos.HoaDonDTO;
import com.example.dreambackend.entities.HoaDon;

import java.util.List;

public interface IHoaDonService {
    HoaDonDTO getHoaDonById(int id);
    HoaDon createHoaDon(HoaDonDTO hoaDonDTO);
    List<HoaDonDTO> getListHoaDon();
    HoaDon updateHoaDon(HoaDonDTO hoaDonDTO);
}

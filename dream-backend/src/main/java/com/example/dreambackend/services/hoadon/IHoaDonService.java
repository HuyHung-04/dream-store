package com.example.dreambackend.services.hoadon;

import com.example.dreambackend.dtos.HoaDonDTO;
import com.example.dreambackend.entities.HoaDon;

import java.util.List;

public interface IHoaDonService {
    HoaDon getHoaDonById(int id);
    HoaDon createHoaDon(HoaDonDTO hoaDonDTO) throws Exception;
    List<HoaDon> getListHoaDon();
    HoaDon updateHoaDon(HoaDonDTO hoaDonDTO);
    List<HoaDon> findHoaDonByKhachHangId(int id);
    void deleteHoaDon(int id);
}

package org.example.dreambackend.services.hoadon;

import org.example.dreambackend.dtos.HoaDonDTO;
import org.example.dreambackend.entities.HoaDon;

import java.util.List;

public interface IHoaDonService {
    HoaDonDTO getHoaDonById(int id);
    HoaDon createHoaDon(HoaDonDTO hoaDonDTO);
    List<HoaDonDTO> getListHoaDon();
}

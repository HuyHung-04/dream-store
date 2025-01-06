package com.example.dreambackend.services.hoadon;

import com.example.dreambackend.dtos.HoaDonDTO;
import com.example.dreambackend.entities.HoaDon;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.util.List;

public interface IHoaDonService {
    HoaDon getHoaDonById(int id);
    HoaDon createHoaDon(HoaDonDTO hoaDonDTO) throws Exception;
    Page<HoaDon> getListHoaDon(Pageable pageable);
    HoaDon updateHoaDon(int id, HoaDonDTO hoaDonDTO);
    List<HoaDon> findHoaDonByKhachHangId(int id);
    void deleteHoaDon(int id);
    List<HoaDon> findFilteredHoaDon(String search1, String search2, String combo1, String combo2, String fromDate, String toDate);
}

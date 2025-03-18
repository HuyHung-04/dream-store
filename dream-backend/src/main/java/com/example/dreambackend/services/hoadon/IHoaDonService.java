package com.example.dreambackend.services.hoadon;

import com.example.dreambackend.entities.HoaDon;
import com.example.dreambackend.requests.HoaDonRequest;
import com.example.dreambackend.requests.HoaDonSearchRequest;
import com.example.dreambackend.responses.HoaDonResponse;

import java.util.List;

public interface IHoaDonService {
    HoaDonResponse updateHoaDon(Integer id, HoaDonRequest request);
    HoaDonResponse createHoaDon(HoaDonRequest request);
    HoaDonResponse findById(Integer id);
    List<HoaDonResponse> getAllHoaDon(HoaDonSearchRequest request);
    void cancelHoaDon(Integer id);
}

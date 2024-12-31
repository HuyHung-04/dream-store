package com.example.dreambackend.services.hoadonchitiet;

import com.example.dreambackend.entities.HoaDonChiTiet;
import com.example.dreambackend.repository.HoaDonChiTietRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class HoaDonChiTietService implements IHoaDonChiTietService{

    private final HoaDonChiTietRepository hoaDonChiTietRepository;

    @Override
    public List<HoaDonChiTiet> getAllHoaDonChiTiet() {
        return hoaDonChiTietRepository.findAll();
    }
}

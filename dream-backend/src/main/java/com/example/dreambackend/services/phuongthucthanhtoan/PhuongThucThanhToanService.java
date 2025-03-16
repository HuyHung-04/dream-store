package com.example.dreambackend.services.phuongthucthanhtoan;

import com.example.dreambackend.dtos.PhuongThucThanhToanDto;
import com.example.dreambackend.repositories.PhuongThucThanhToanRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class PhuongThucThanhToanService {
    @Autowired
    private PhuongThucThanhToanRepository phuongThucThanhToanRepository;

    public List<PhuongThucThanhToanDto> getIdAndTen() {
        return phuongThucThanhToanRepository.findIdAndTen();
    }
}

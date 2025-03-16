package com.example.dreambackend.controllers;

import com.example.dreambackend.dtos.PhuongThucThanhToanDto;
import com.example.dreambackend.dtos.VoucherDto;
import com.example.dreambackend.entities.PhuongThucThanhToan;
import com.example.dreambackend.services.phuongthucthanhtoan.PhuongThucThanhToanService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/phuong-thuc-thanh-toan")
@CrossOrigin(origins = "http://localhost:4201")
public class PhuongThucThanhToanController {

    @Autowired
    private PhuongThucThanhToanService phuongThucThanhToanService;

    @GetMapping("/payment-methods")
    public ResponseEntity<List<PhuongThucThanhToanDto>> phuongThucThanhToanPaymentMethods() {
        List<PhuongThucThanhToanDto> phuongThucThanhToanDtos = phuongThucThanhToanService.getIdAndTen();
        return ResponseEntity.ok(phuongThucThanhToanDtos);
    }
}

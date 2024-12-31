package com.example.dreambackend.controllers;

import com.example.dreambackend.entities.HoaDonChiTiet;
import com.example.dreambackend.responses.ResponseObject;
import com.example.dreambackend.services.hoadonchitiet.HoaDonChiTietService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/hoa-don-chi-tiet")
public class HoaDonChiTietController {

    @Autowired
    private HoaDonChiTietService hoaDonChiTietService;

    @GetMapping
    public ResponseEntity<ResponseObject> hoaDonChiTiet() {
        List<HoaDonChiTiet> lstHDCT = hoaDonChiTietService.getAllHoaDonChiTiet();
        return ResponseEntity.ok().body(ResponseObject.builder()
                        .message("Successfully")
                        .status(HttpStatus.OK)
                        .data(lstHDCT)
                .build());
    }
}

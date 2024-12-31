package com.example.dreambackend.controllers;

import com.example.dreambackend.entities.SanPhamChiTiet;
import com.example.dreambackend.responses.ResponseObject;
import com.example.dreambackend.services.sanphamchitiet.SanPhamChiTietService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/san-pham-chi-tiet")
public class SanPhamChiTietController {
    @Autowired
    private SanPhamChiTietService sanPhamChiTietService;

    @GetMapping("/list")
    public ResponseEntity<ResponseObject> sanPhamChiTiet() {
        List<SanPhamChiTiet> listSPCT = sanPhamChiTietService.getAllSanPhamChiTiet();
        return ResponseEntity.ok().body(ResponseObject.builder()
                        .message("List SanPhamChiTiet")
                        .status(HttpStatus.OK)
                        .data(listSPCT)
                .build());
    }
}

package org.example.dreambackend.controller;

import org.example.dreambackend.dtos.SanPhamChiTietDTO;
import org.example.dreambackend.services.sanphamchitiet.SanPhamChiTietService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping
public class SanPhamChiTietController {
    @Autowired
    private SanPhamChiTietService sanPhamChiTietService;

    @GetMapping("/list")
    public List<SanPhamChiTietDTO> sanPhamChiTiet() {return sanPhamChiTietService.getAllSanPhamChiTiet();}
}

package com.example.dreambackend.controller;

import com.example.dreambackend.dtos.SanPhamChiTietDTO;
import com.example.dreambackend.entities.SanPhamChiTiet;
import com.example.dreambackend.services.sanphamchitiet.SanPhamChiTietService;
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
    public List<SanPhamChiTiet> sanPhamChiTiet() {return sanPhamChiTietService.getAllSanPhamChiTiet();}
}

package com.example.dreambackend.controllers;

import com.example.dreambackend.entities.SanPham;
import com.example.dreambackend.services.chatlieu.ChatLieuService;
import com.example.dreambackend.services.coao.CoAoService;
import com.example.dreambackend.services.sanpham.SanPhamService;
import com.example.dreambackend.services.thuonghieu.ThuongHieuService;
import com.example.dreambackend.services.xuatxu.XuatXuService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/san-pham")
// cho phép các request Angular truy cập vào các API
@CrossOrigin(origins = "http://localhost:4200")
public class SanPhamController {
    @Autowired
    SanPhamService sanPhamService;
    @Autowired
    ThuongHieuService thuongHieuService;
    @Autowired
    ChatLieuService chatLieuService;
    @Autowired
    CoAoService coAoService;
    @Autowired
    XuatXuService xuatXuService;

    @GetMapping("/hien-thi")
    public ResponseEntity<List<SanPham>> hienThi(){
        List<SanPham> listSanPham = sanPhamService.getAllSanPham();
        return ResponseEntity.ok(listSanPham);
    }
}

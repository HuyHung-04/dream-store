package com.example.dreambackend.controllers;

import com.example.dreambackend.entities.KhuyenMai;
import com.example.dreambackend.entities.Voucher;
import com.example.dreambackend.services.khuyenmai.KhuyenMaiService;
import com.example.dreambackend.services.voucher.VoucherService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/khuyenmai")
public class KhuyenMaiController {
    @Autowired
    KhuyenMaiService khuyenMaiService;
    @GetMapping("/hien-thi")
    public ResponseEntity<List<KhuyenMai>> hienThi() {
        List<KhuyenMai> listVC = khuyenMaiService.getAllKhuyenMai();
        return ResponseEntity.ok(listVC);
    }
    @PostMapping("/add")
    public ResponseEntity<KhuyenMai> addKhuyenMai(@RequestBody KhuyenMai khuyenMai) {
        KhuyenMai savedKhuyenMai = khuyenMaiService.addKhuyenMai(khuyenMai);
        return ResponseEntity.ok(savedKhuyenMai);
    }
    @PostMapping("/update")
    public ResponseEntity<KhuyenMai> updateKhuyenMai(@RequestBody KhuyenMai khuyenMai) {
        KhuyenMai savedKhuyenMai = khuyenMaiService.updateKhuyenMai(khuyenMai);
        return ResponseEntity.ok(savedKhuyenMai);
    }
    @GetMapping("/{id}")
    public ResponseEntity<KhuyenMai> getKhuyenMaiDetail(@PathVariable Integer id) {
        try {
            KhuyenMai khuyenMai = khuyenMaiService.getKhuyenMaiById(id);
            return ResponseEntity.ok(khuyenMai);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(null);
        }
    }
}

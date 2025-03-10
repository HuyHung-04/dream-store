package com.example.dreambackend.controllers;

import com.example.dreambackend.entities.DiaChiKhachHang;
import com.example.dreambackend.requests.DiaChiKhachHangRequest;
import com.example.dreambackend.responses.DiaChiKhachHangRespone;
import com.example.dreambackend.services.diachikhachhang.DiaChiKhachHangService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.BindingResult;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/dia-chi-khach-hang")
@CrossOrigin(origins = {"http://localhost:4201", "http://localhost:4200"})
public class DiaChiKhachHangController {
    @Autowired
    private DiaChiKhachHangService diaChiKhachHangService;

    @GetMapping("/hien-thi/{idKhachHang}")
    public ResponseEntity<List<DiaChiKhachHangRespone>> getDiaChiByKhachHang(@PathVariable Integer idKhachHang) {
        List<DiaChiKhachHangRespone> diaChiList = diaChiKhachHangService.getDiaChiKhachHang(idKhachHang);
        return ResponseEntity.ok(diaChiList);
    }

    @PostMapping("/add")
    public ResponseEntity<?> addDiaChiKhachHang(@Valid @RequestBody DiaChiKhachHangRequest request, BindingResult result) {
        if (result.hasErrors()) {
            return ResponseEntity.badRequest().body(result.getAllErrors());
        }
        DiaChiKhachHang diaChi = diaChiKhachHangService.addDiaChi(request);
        return ResponseEntity.ok(diaChi);
    }

    @PutMapping("/update/{id}")
    public ResponseEntity<?> updateDiaChiKhachHang(@PathVariable Integer id, @Valid @RequestBody DiaChiKhachHangRequest request, BindingResult result) {
        if (result.hasErrors()) {
            return ResponseEntity.badRequest().body(result.getAllErrors());
        }
        DiaChiKhachHang diaChi = diaChiKhachHangService.updateDiaChi(id, request);
        return ResponseEntity.ok(diaChi);
    }
}

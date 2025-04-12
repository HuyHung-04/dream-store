package com.example.dreambackend.controllers;

import com.example.dreambackend.entities.GioHangChiTiet;
import com.example.dreambackend.entities.HoaDon;
import com.example.dreambackend.entities.HoaDonChiTiet;
import com.example.dreambackend.entities.SanPhamChiTiet;
import com.example.dreambackend.repositories.SanPhamChiTietOnlineRepository;
import com.example.dreambackend.requests.GioHangChiTietRequest;
import com.example.dreambackend.responses.GioHangChiTietResponse;
import com.example.dreambackend.services.giohangchitiet.GioHangChiTietService;
import com.example.dreambackend.services.hoadononline.HoaDonOnlineService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api/gio-hang")
@CrossOrigin(origins = {"http://localhost:4201", "http://localhost:4200"})
public class GioHangChiTietController {
    @Autowired
    GioHangChiTietService gioHangChiTietService;
    @Autowired
    HoaDonOnlineService hoaDonOnlineService;
    @Autowired
    SanPhamChiTietOnlineRepository sanPhamChiTietOnlineRepository;
    @GetMapping("/hien-thi")
    public ResponseEntity<List<GioHangChiTietResponse>> getGioHangChiTiet(@RequestParam Integer idKhachHang) {
        List<GioHangChiTietResponse> responseList = gioHangChiTietService.getGioHangChiTietByKhachHangId(idKhachHang);
        return ResponseEntity.ok(responseList);
    }

    @PostMapping("/add")
    public ResponseEntity<GioHangChiTietResponse> themSanPhamVaoGio(@RequestBody GioHangChiTietRequest request) {
        GioHangChiTietResponse response = gioHangChiTietService.themSanPhamVaoGio(request);
        return ResponseEntity.ok(response);
    }

    @DeleteMapping("/delete/{id}")
    public ResponseEntity<Void> deleteGioHangChiTiet(@PathVariable Integer id) {
        gioHangChiTietService.xoaSanPhamKhoiGio(id);
        return ResponseEntity.noContent().build();
    }

    @PutMapping("/update-soluong/{id}")
    public ResponseEntity<GioHangChiTietResponse> suaSoLuongSanPham(@PathVariable Integer id, @RequestParam Integer soLuongMoi) {
        GioHangChiTietResponse response = gioHangChiTietService.suaSoLuongSanPham(id, soLuongMoi);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/thanh-toan/{idKhachHang}")
    public ResponseEntity<List<Integer>> getGioHangThanhToan(@PathVariable Integer idKhachHang) {
        List<Integer> gioHangIds = hoaDonOnlineService.getGioHangIdsForThanhToan(idKhachHang);

        if (gioHangIds.isEmpty()) {
            return ResponseEntity.noContent().build();
        }
        return ResponseEntity.ok(gioHangIds);
    }

    @PostMapping("/mua-ngay")
    public ResponseEntity<GioHangChiTietResponse> muaNgay(@RequestBody GioHangChiTietRequest request) {
        GioHangChiTietResponse response = gioHangChiTietService.muaNgay(request);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/{id}")
    public ResponseEntity<Integer> getSoLuong(@PathVariable Integer id) {
        Optional<SanPhamChiTiet> optional = sanPhamChiTietOnlineRepository.findById(id);
        if (optional.isPresent()) {
            return ResponseEntity.ok(optional.get().getSoLuong());
        } else {
            return ResponseEntity.notFound().build();
        }
    }
}
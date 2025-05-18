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

import java.util.Collections;
import java.util.List;
import java.util.Map;
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
    public ResponseEntity<?> themSanPhamVaoGio(@RequestBody GioHangChiTietRequest request) {
        try {
            GioHangChiTietResponse response = gioHangChiTietService.themSanPhamVaoGio(request);
            return ResponseEntity.ok(response);
        } catch (ResponseStatusException ex) {
            return ResponseEntity
                    .status(ex.getStatusCode())
                    .body(Collections.singletonMap("message", ex.getReason()));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("Đã xảy ra lỗi không xác định.");
        }
    }



    @DeleteMapping("/delete/{id}")
    public ResponseEntity<Void> deleteGioHangChiTiet(@PathVariable Integer id) {
        gioHangChiTietService.xoaSanPhamKhoiGio(id);
        return ResponseEntity.noContent().build();
    }

    @PutMapping("/update-soluong/{id}")
    public ResponseEntity<?> suaSoLuongSanPham(
            @PathVariable Integer id,
            @RequestParam Integer soLuongMoi
    ) {
        try {
            GioHangChiTietResponse response = gioHangChiTietService.suaSoLuongSanPham(id, soLuongMoi);
            return ResponseEntity.ok(response);
        } catch (ResponseStatusException ex) {
            return ResponseEntity
                    .status(ex.getStatusCode())
                    .body(Collections.singletonMap("message", ex.getReason()));
        } catch (Exception e) {
            return ResponseEntity
                    .status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Collections.singletonMap("message", "Đã xảy ra lỗi khi cập nhật số lượng."));
        }
    }


    @GetMapping("/thanh-toan/{idKhachHang}")
    public ResponseEntity<?> getGioHangThanhToan(@PathVariable Integer idKhachHang) {
        try {
            List<GioHangChiTietResponse> gioHangList = hoaDonOnlineService.getGioHangIdsForThanhToan(idKhachHang);

            return ResponseEntity.ok(gioHangList);

        } catch (ResponseStatusException ex) {
            return ResponseEntity
                    .status(ex.getStatusCode())
                    .body(Collections.singletonMap("message", ex.getReason()));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("Đã xảy ra lỗi không xác định.");
        }
    }



    @PostMapping("/mua-ngay")
    public ResponseEntity<?> muaNgay(@RequestBody GioHangChiTietRequest request) {
        try {
            GioHangChiTietResponse response = gioHangChiTietService.muaNgay(request);
            return ResponseEntity.ok(response);
        } catch (ResponseStatusException ex) {
            return ResponseEntity
                    .status(ex.getStatusCode())
                    .body(Collections.singletonMap("message", ex.getReason()));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("Đã xảy ra lỗi không xác định.");
        }
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
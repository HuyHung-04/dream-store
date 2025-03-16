package com.example.dreambackend.controllers;

import com.example.dreambackend.entities.DiaChiKhachHang;
import com.example.dreambackend.entities.KhuyenMai;
import com.example.dreambackend.requests.DiaChiKhachHangRequest;
import com.example.dreambackend.responses.DiaChiKhachHangRespone;
import com.example.dreambackend.services.diachikhachhang.DiaChiKhachHangService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
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
    public ResponseEntity<List<DiaChiKhachHang>> getDiaChiByKhachHang(@PathVariable Integer idKhachHang) {
        List<DiaChiKhachHang> diaChiList = diaChiKhachHangService.getDiaChiKhachHang(idKhachHang);
        return ResponseEntity.ok(diaChiList);
    }

    @PostMapping("/add")
    public ResponseEntity<?> addDiaChiKhachHang( @RequestBody DiaChiKhachHangRequest diaChiKhachHang) {

        DiaChiKhachHang diaChi = diaChiKhachHangService.addDiaChi(diaChiKhachHang);
        return ResponseEntity.ok(diaChi);
    }

    @PutMapping("/update")
    public ResponseEntity<?> updateDiaChiKhachHang( @RequestBody DiaChiKhachHang diachi) {
        DiaChiKhachHang diaChi = diaChiKhachHangService.updateDiaChi(diachi);
        return ResponseEntity.ok(diaChi);
    }

    // ✅ API lấy ID địa chỉ theo số điện thoại người nhận
    @GetMapping("/id-by-sdt")
    public ResponseEntity<?> getIdBySdtNguoiNhan(@RequestParam String sdtNguoiNhan) {
        Integer idDiaChi = diaChiKhachHangService.getIdBySdtNguoiNhan(sdtNguoiNhan);
        if (idDiaChi == null) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body("Không tìm thấy địa chỉ với số điện thoại: " + sdtNguoiNhan);
        }
        return ResponseEntity.ok(idDiaChi);
    }

    @GetMapping("/{id}")
    public ResponseEntity<DiaChiKhachHang> getDiaChiDetail(@PathVariable Integer id) {
        try {
            DiaChiKhachHang diaChiKhachHang = diaChiKhachHangService.getDiaChiById(id);
            return ResponseEntity.ok(diaChiKhachHang);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(null);
        }
    }

    @DeleteMapping("/delete/{id}")
    public ResponseEntity<Void> deleteDiaChiKhachHang(@PathVariable Integer id) {
            diaChiKhachHangService.deleteDiaChi(id);
            return ResponseEntity.noContent().build();

    }

}

package com.example.dreambackend.controllers;

import com.example.dreambackend.requests.SanPhamRequest;
import com.example.dreambackend.responses.SanPhamRespone;
import com.example.dreambackend.services.chatlieu.ChatLieuService;
import com.example.dreambackend.services.coao.CoAoService;
import com.example.dreambackend.services.sanpham.SanPhamService;
import com.example.dreambackend.services.thuonghieu.ThuongHieuService;
import com.example.dreambackend.services.xuatxu.XuatXuService;
import com.example.dreambackend.security.IsQuanLy;
import com.example.dreambackend.security.IsReadOnly;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.BindingResult;
import org.springframework.validation.FieldError;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

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

    @IsReadOnly
    @GetMapping("/hien-thi")
    public ResponseEntity<Page<SanPhamRespone>> hienThi(
            @RequestParam(value = "page", defaultValue = "0") Integer page,
            @RequestParam(value = "size", defaultValue = "7") Integer size) {

        Pageable pageable = PageRequest.of(page,size);
        Page<SanPhamRespone> listSanPham = sanPhamService.getAllSanPham(pageable);
        return ResponseEntity.ok(listSanPham);
    }

    @IsQuanLy
    @PostMapping("/add")
    public ResponseEntity<Map<String, String>> addSanPham(@Valid @RequestBody SanPhamRequest sanPhamRequest, BindingResult result) {
        if (result.hasErrors()) {
            Map<String, String> errors = new HashMap<>();
            for (FieldError error : result.getFieldErrors()) {
                errors.put(error.getField(), error.getDefaultMessage());
            }
            return ResponseEntity.badRequest().body(errors);
        }
        sanPhamService.addSanPham(sanPhamRequest);
        Map<String, String> response = new HashMap<>();
        response.put("message", "Thêm thành công");
        return ResponseEntity.ok(response);
    }

    @GetMapping("/exists-by-ten")
    public ResponseEntity<Boolean> existsByTen(@RequestParam String ten) {
        return ResponseEntity.ok(sanPhamService.existsTenSanPham(ten));
    }

    @IsQuanLy
    @PutMapping("/update")
    public ResponseEntity<Map<String, String>> updateSanPham(@Valid @RequestBody SanPhamRequest sanPhamRequest, BindingResult result) {
        if (result.hasErrors()) {
            Map<String, String> errors = new HashMap<>();
            for (FieldError error : result.getFieldErrors()) {
                errors.put(error.getField(), error.getDefaultMessage());
            }
            return ResponseEntity.badRequest().body(errors);
        }
        sanPhamService.updateSanPham(sanPhamRequest);
        Map<String, String> response = new HashMap<>();
        response.put("message", "Sửa thành công");
        return ResponseEntity.ok(response);
    }

    @GetMapping("/xuat-excel")
    public ResponseEntity<byte[]> exportSanPhamToExcel() {
        List<SanPhamRespone> sanPhams = sanPhamService.getAllSanPham(Pageable.unpaged()).getContent();
        return sanPhamService.exportSanPhamToExcel(sanPhams);
    }

    @GetMapping("/tim-kiem")
    public ResponseEntity<Page<SanPhamRespone>> searchSanPham(
            @RequestParam(value = "thuongHieuId", required = false) Integer thuongHieuId,
            @RequestParam(value = "xuatXuId", required = false) Integer xuatXuId,
            @RequestParam(value = "chatLieuId", required = false) Integer chatLieuId,
            @RequestParam(value = "coAoId", required = false) Integer coAoId,
            @RequestParam(value = "trangThai", required = false) Integer trangThai,
            @RequestParam(value = "ten", required = false) String ten,
            @RequestParam(value = "page", defaultValue = "0") Integer page,
            @RequestParam(value = "size", defaultValue = "7") Integer size) {

        Pageable pageable = PageRequest.of(page, size);
        Page<SanPhamRespone> listSanPham = sanPhamService.searchSanPham(thuongHieuId, xuatXuId, chatLieuId, coAoId, trangThai, ten, pageable);
        return ResponseEntity.ok(listSanPham);
    }
}
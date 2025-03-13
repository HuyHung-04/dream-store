package com.example.dreambackend.controllers;

import com.example.dreambackend.dtos.SanPhamChiTietDto;
import com.example.dreambackend.entities.KhuyenMai;
import com.example.dreambackend.entities.SanPhamChiTiet;
import com.example.dreambackend.services.khuyenmai.KhuyenMaiService;
import com.example.dreambackend.services.sanphamchitiet.SanPhamChiTietService;
import com.example.dreambackend.services.voucher.VoucherService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/khuyenmai")
@CrossOrigin(origins = "http://localhost:4200")
public class KhuyenMaiController {
    @Autowired
    KhuyenMaiService khuyenMaiService;

    @GetMapping("/hien-thi")
    public ResponseEntity<Page<KhuyenMai>> hienThiPaged(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "8") int size) {
        Page<KhuyenMai> pagedKhuyenMais = khuyenMaiService.getAllKhuyenMaiPaged(page, size);
        return ResponseEntity.ok(pagedKhuyenMais);
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

    @GetMapping("/search")
    public List<KhuyenMai> searchKhuyenMaiByName(@RequestParam("ten") String ten) {
        return khuyenMaiService.searchKhuyenMaiByName(ten);
    }

    @GetMapping("/{khuyenMaiId}/select-products")
    public ResponseEntity<List<SanPhamChiTietDto>> getAvailableProducts(
            @PathVariable Integer khuyenMaiId,
            @RequestParam(required = false) String tenSanPham) {
        List<SanPhamChiTietDto> products = khuyenMaiService.findAvailableProducts(tenSanPham, khuyenMaiId);
        return ResponseEntity.ok(products);
    }


    @PostMapping("/{khuyenMaiId}/update-products")
    public ResponseEntity<Map<String, String>> updateKhuyenMaiProducts(
            @PathVariable Integer khuyenMaiId,
            @RequestBody List<Integer> productIds
    ) {
        try {
            khuyenMaiService.updateKhuyenMaiProducts(khuyenMaiId, productIds);
            Map<String, String> response = new HashMap<>();
            response.put("message", "Cập nhật sản phẩm cho khuyến mãi thành công");
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            Map<String, String> errorResponse = new HashMap<>();
            errorResponse.put("error", "Có lỗi xảy ra: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(errorResponse);
        }
    }

}

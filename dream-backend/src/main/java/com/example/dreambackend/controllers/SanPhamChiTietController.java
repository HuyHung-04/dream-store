package com.example.dreambackend.controllers;

import com.example.dreambackend.entities.SanPhamChiTiet;
import com.example.dreambackend.repositories.HoaDonChiTietRepository;
import com.example.dreambackend.requests.SanPhamChiTietRequest;
import com.example.dreambackend.responses.GetSanPhamToBanHangRespone;
import com.example.dreambackend.responses.SanPhamChiTietRespone;
import com.example.dreambackend.services.mausac.MauSacService;
import com.example.dreambackend.services.sanpham.SanPhamService;
import com.example.dreambackend.services.sanphamchitiet.SanPhamChiTietService;
import com.example.dreambackend.services.size.SizeService;
import com.example.dreambackend.repositories.SanPhamChiTietRepository;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.BindingResult;
import org.springframework.validation.FieldError;
import org.springframework.web.bind.annotation.*;

import java.util.Collections;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/san-pham-chi-tiet")
@CrossOrigin(origins = "http://localhost:4200")
public class SanPhamChiTietController {
    @Autowired
    private SanPhamChiTietService sanPhamChiTietService;

    @Autowired
    private SanPhamService sanPhamService;

    @Autowired
    private MauSacService mauSacService;

    @Autowired
    private SizeService sizeService;

    @Autowired
    private SanPhamChiTietRepository sanPhamChiTietRepository;

    @Autowired
    private HoaDonChiTietRepository hoaDonChiTietRepository;

    @GetMapping("/hien-thi")
    public ResponseEntity<Page<SanPhamChiTietRespone>> hienThi(
            @RequestParam(value = "idSanPham") Integer idSanPham,
            @RequestParam(value = "page", defaultValue = "0") Integer page,
            @RequestParam(value = "size", defaultValue = "5") Integer size) {

        Pageable pageable = PageRequest.of(page,size);
        Page<SanPhamChiTietRespone> listSanPhamChiTiet = sanPhamChiTietService.getSanPhamChiTietBySanPhamId(idSanPham, pageable);

        return ResponseEntity.ok(listSanPhamChiTiet);
    }

    @PostMapping("/add")
    public ResponseEntity<?> add(@Valid @RequestBody SanPhamChiTietRequest sanPhamChiTietRequest, BindingResult result) {
        if (result.hasErrors()) {
            Map<String, String> errors = new HashMap<>();
            for (FieldError error : result.getFieldErrors()) {
                errors.put(error.getField(), error.getDefaultMessage());
            }
            return ResponseEntity.badRequest().body(errors);
        }

        try {
            List<SanPhamChiTiet> sanPhamChiTietList = sanPhamChiTietService.addSanPhamChiTiet(sanPhamChiTietRequest);
            Map<String, Object> response = new HashMap<>();
            response.put("message", "Thêm thành công");
            response.put("soLuongSanPhamChiTiet", sanPhamChiTietList.size());
            response.put("sanPhamChiTietList", sanPhamChiTietList);
            return ResponseEntity.ok(response);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(Collections.singletonMap("error", e.getMessage()));
        }
    }

    @PutMapping("/update")
    public ResponseEntity<?> update(@Valid @RequestBody SanPhamChiTietRequest sanPhamChiTietRequest, BindingResult result) {
        if (result.hasErrors()) {
            Map<String, String> errors = new HashMap<>();
            for (FieldError error : result.getFieldErrors()) {
                errors.put(error.getField(), error.getDefaultMessage());
            }
            return ResponseEntity.badRequest().body(errors);
        }
        sanPhamChiTietService.updateSanPhamChiTiet(sanPhamChiTietRequest);
        Map<String, String> response = new HashMap<>();
        response.put("message", "Sửa thành công");
        return ResponseEntity.ok(response);
    }

    @GetMapping("/tim-kiem")
    public ResponseEntity<Page<SanPhamChiTietRespone>> timKiemSanPhamChiTiet(
            @RequestParam(value = "idSanPham") Integer idSanPham,
            @RequestParam(value = "gia", required = false) Double gia,
            @RequestParam(value = "soLuong", required = false) Integer soLuong,
            @RequestParam(value = "idMauSac", required = false) Integer idMauSac,
            @RequestParam(value = "idSize", required = false) Integer idSize,
            @RequestParam(value = "trangThai", required = false) Integer trangThai,
            @RequestParam(value = "page", defaultValue = "0") int page,
            @RequestParam(value = "size", defaultValue = "5") int size) {

        Pageable pageable = PageRequest.of(page, size);
        Page<SanPhamChiTietRespone> result = sanPhamChiTietService.timKiemSanPhamChiTiet(
                idSanPham, gia, soLuong, idMauSac, idSize, trangThai, pageable);

        return ResponseEntity.ok(result);
    }

    @GetMapping(value = "/xuat-excel", produces = "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet")
    public ResponseEntity<byte[]> exportSanPhamChiTietToExcel(@RequestParam("idSanPham") Integer idSanPham) {
        // Lấy danh sách sản phẩm chi tiết từ service
        List<SanPhamChiTietRespone> sanPhamChiTiets = sanPhamChiTietService
                .getSanPhamChiTietBySanPhamId(idSanPham, Pageable.unpaged()).getContent();
        // Gọi service để xuất file Excel
        return sanPhamChiTietService.exportSanPhamChiTietToExcel(sanPhamChiTiets);
    }

    @GetMapping("/ban-hang")
    public ResponseEntity<Page<GetSanPhamToBanHangRespone>> getSanPhamBanHang(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "4") int size) {
        Pageable pageable = PageRequest.of(page, size);
        Page<GetSanPhamToBanHangRespone> danhSachSanPham = sanPhamChiTietService.laySanPhamChoBanHang(pageable);
        return ResponseEntity.ok(danhSachSanPham);
    }

    @GetMapping("/loc-ban-hang")
    public ResponseEntity<Page<GetSanPhamToBanHangRespone>> getSanPhamBanHang(
            @RequestParam(required = false) String tenSanPham,
            @RequestParam(required = false) String mauSac,
            @RequestParam(required = false) String size,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "4") int sizePage) {

        Page<GetSanPhamToBanHangRespone> sanPhams = sanPhamChiTietService.locSanPham(tenSanPham, mauSac, size, page, sizePage);
        return ResponseEntity.ok(sanPhams);
    }

    @PutMapping("/ban-hang/update-so-luong/{id}")
    public ResponseEntity<?> updateSoLuong(
            @PathVariable Integer id,
            @RequestParam Integer soLuong,
            @RequestParam Boolean isIncrease) {
        try {
            SanPhamChiTiet updatedProduct = sanPhamChiTietService.updateSoLuongBanHang(id, soLuong, isIncrease);
            return ResponseEntity.ok().build();
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Lỗi khi cập nhật số lượng: " + e.getMessage());
        }
    }

    @GetMapping("/ckeck-spct/{id}")
    public ResponseEntity<Boolean> checkSpct(@PathVariable Integer id) {
        boolean isUsed = hoaDonChiTietRepository.existsBySanPhamChiTiet_Id(id);
        return ResponseEntity.ok(isUsed);
    }
}

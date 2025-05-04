package com.example.dreambackend.controllers;

import com.example.dreambackend.responses.*;
import com.example.dreambackend.services.thongke.ThongKeService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/thong-ke")
@CrossOrigin(origins = "*")
public class ThongKeController {

    @Autowired
    private ThongKeService thongKeService;

    @GetMapping("/{type}")
    public ResponseEntity<ThongKeResponse> thongKeTongQuan(@PathVariable String type) {
        ThongKeResponse response = thongKeService.thongKeTongQuan(type);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/nam-nay/thang")
    public ResponseEntity<List<ThongKeThangResponse>> thongKeTungThang(@RequestParam("year") int year) {
        List<ThongKeThangResponse> response = thongKeService.thongKeTungThang(year);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/tat-ca/nam")
    public ResponseEntity<List<ThongKeThangResponse>> thongKeTungNam() {
        List<ThongKeThangResponse> response = thongKeService.thongKeTungNam();
        return ResponseEntity.ok(response);
    }
    // Endpoint lấy doanh thu từng ngày trong tháng này
    @GetMapping("/thang-nay/ngay")
    public ResponseEntity<List<ThongKeThangNayResponse>> thongKeTungNgayTrongThang(
            @RequestParam("month") int month,
            @RequestParam("year") int year) {

        List<ThongKeThangNayResponse> response = thongKeService.thongKeTungNgayTrongThang(month, year);
        return ResponseEntity.ok(response);
    }

    // API để lấy tổng quan theo tháng và năm
    @GetMapping("/thongke/tongquan")
    public ResponseEntity<ThongKeResponse> getThongKeTongQuan(
            @RequestParam(value = "month") int month,
            @RequestParam(value = "year") int year) {

        ThongKeResponse thongKeResponse = thongKeService.getTongQuanTheoThangVaNam(month, year);
        return ResponseEntity.ok(thongKeResponse);
    }

    // Endpoint lấy doanh thu ngày hôm nay
    @GetMapping("/hom-nay")
    public ResponseEntity<ThongKeHomNayResponse> thongKeHomNay() {
        ThongKeHomNayResponse response = thongKeService.thongKeHomNay();
        return ResponseEntity.ok(response);
    }
    // Endpoint lấy top sản phẩm bán chạy nhất trong ngày hôm nay
    @GetMapping("/hom-nay/top-san-pham")
    public ResponseEntity<List<TopSanPhamResponse>> topSanPhamHomNay() {
        List<TopSanPhamResponse> response = thongKeService.topSanPhamHomNay();
        return ResponseEntity.ok(response);
    }

    // Endpoint lấy top sản phẩm bán chạy theo tháng và năm
    @GetMapping("/top-san-pham")
    public ResponseEntity<List<TopSanPhamResponse>> topSanPhamTheoThangVaNam(
            @RequestParam("thang") int thang,
            @RequestParam("nam") int nam) {

        List<TopSanPhamResponse> response = thongKeService.topSanPhamTheoThangVaNam(thang, nam);
        return ResponseEntity.ok(response);
    }


    // Endpoint lấy top sản phẩm bán chạy theo năm truyền vào
    @GetMapping("/top-san-pham-nam")
    public ResponseEntity<List<TopSanPhamResponse>> topSanPhamTheoNam(@RequestParam("nam") int nam) {
        List<TopSanPhamResponse> response = thongKeService.topSanPhamTheoNam(nam);
        return ResponseEntity.ok(response);
    }


    // Endpoint lấy top sản phẩm bán chạy nhất tất cả thời gian
    @GetMapping("/tat-ca/top-san-pham")
    public ResponseEntity<List<TopSanPhamResponse>> topSanPhamTatCa() {
        List<TopSanPhamResponse> response = thongKeService.topSanPhamTatCa();
        return ResponseEntity.ok(response);
    }
}

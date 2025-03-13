package com.example.dreambackend.controllers;

import com.example.dreambackend.dtos.VoucherDto;
import com.example.dreambackend.entities.GioHangChiTiet;
import com.example.dreambackend.entities.Voucher;
import com.example.dreambackend.responses.GioHangChiTietResponse;
import com.example.dreambackend.services.hoadononline.HoaDonOnlineService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/hoa-don-online")
@CrossOrigin(origins = "http://localhost:4201")
public class HoaDonOnlineController {

    @Autowired
    private HoaDonOnlineService hoaDonOnlineService;

    @GetMapping("/gio-hang-hoa-don/{idKhachHang}")
    public ResponseEntity<List<GioHangChiTietResponse>> getChiTietGioHangSauThanhToan(@PathVariable Integer idKhachHang) {
        List<GioHangChiTietResponse> gioHangChiTietList = hoaDonOnlineService.getChiTietGioHangSauThanhToan(idKhachHang);

        if (gioHangChiTietList.isEmpty()) {
            return ResponseEntity.noContent().build(); // Trả về HTTP 204 nếu giỏ hàng trống
        }

        return ResponseEntity.ok(gioHangChiTietList);
    }

    @GetMapping("/tinh-tong-tien")
    public ResponseEntity<Double> getTotalPrice(@RequestParam Integer idKhachHang) {
        Double totalPrice = hoaDonOnlineService.calculateTotalPrice(idKhachHang);
        if (totalPrice == null) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(0.0);
        }
        return ResponseEntity.ok(totalPrice);
    }

    @GetMapping("/vouchers")
    public List<VoucherDto> getVoucherIdAndTen() {
        return hoaDonOnlineService.getVoucherIdAndTen();
    }

    // Phương thức để tính tổng tiền thanh toán sau khi áp dụng voucher
    @PostMapping("/tong-tien-thanh-toan")
    public ResponseEntity<Double> calculateTotalWithVoucher(@RequestParam Integer idKhachHang,@RequestParam Integer idVoucher) {
        // Gọi service để tính toán tổng tiền sau khi áp dụng voucher
        Double totalPriceAfterDiscount = hoaDonOnlineService.calculateTotalPriceWithVoucher(
             idKhachHang,idVoucher
        );

        return ResponseEntity.ok(totalPriceAfterDiscount);
    }
}

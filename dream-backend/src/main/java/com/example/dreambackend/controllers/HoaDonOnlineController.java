package com.example.dreambackend.controllers;

import com.example.dreambackend.dtos.VoucherDto;
import com.example.dreambackend.entities.GioHangChiTiet;
import com.example.dreambackend.entities.HoaDon;
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

    @GetMapping("/vouchers/{idKhachHang}")
    public ResponseEntity<List<VoucherDto>> getAvailableVouchers(@PathVariable Integer idKhachHang) {
        List<VoucherDto> vouchers = hoaDonOnlineService.getVoucherIdAndTen(idKhachHang);
        return ResponseEntity.ok(vouchers);
    }

    // Phương thức để tính tổng tiền thanh toán sau khi áp dụng voucher
    @PostMapping("/tong-tien-thanh-toan")
    public ResponseEntity<Double> getTotalPrice(
            @RequestParam Integer idKhachHang,
            @RequestParam Integer voucherId,
            @RequestParam Double shippingFee) {
        Double totalPrice = hoaDonOnlineService.calculateTotalPriceWithVoucher(idKhachHang, voucherId, shippingFee);
        return ResponseEntity.ok(totalPrice);
    }

    // Tạo hóa đơn và thêm sản phẩm
    @PostMapping("/create")
    public ResponseEntity<HoaDon> createHoaDon(
            @RequestParam Integer idKhachHang,
            @RequestParam Integer voucherId,
            @RequestParam Double tongTienTruocGiam,
            @RequestParam Integer paymentMethodId,
            @RequestParam Double TongTienSauGiam,
            @RequestParam String sdtNguoiNhan,
            @RequestParam String tenNguoiNhan,
            @RequestParam String diaChi,
            @RequestParam Double shippingFee
    ) {

        try {
            HoaDon hoaDon = hoaDonOnlineService.createHoaDonAndAddProducts(
                    idKhachHang, voucherId, tongTienTruocGiam, paymentMethodId, TongTienSauGiam,sdtNguoiNhan,tenNguoiNhan,diaChi,shippingFee     );
            return new ResponseEntity<>(hoaDon, HttpStatus.CREATED);
        } catch (Exception e) {
            return new ResponseEntity<>(null, HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
}

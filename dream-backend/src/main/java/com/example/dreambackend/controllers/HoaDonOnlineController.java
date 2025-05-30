package com.example.dreambackend.controllers;

import com.example.dreambackend.dtos.HoaDonChiTietDto;
import com.example.dreambackend.dtos.HoaDonDto;
import com.example.dreambackend.dtos.VoucherDto;
import com.example.dreambackend.entities.GioHangChiTiet;
import com.example.dreambackend.entities.HoaDon;
import com.example.dreambackend.entities.Voucher;
import com.example.dreambackend.requests.HoaDonOnlineRequest;
import com.example.dreambackend.responses.GioHangChiTietResponse;
import com.example.dreambackend.services.hoadononline.HoaDonOnlineService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import java.util.*;

@RestController
@RequestMapping("/api/hoa-don-online")
@CrossOrigin(origins = "http://localhost:4201")
public class HoaDonOnlineController {

    @Autowired
    private HoaDonOnlineService hoaDonOnlineService;

    //phương thức load giỏ hàng chi tiết
    @GetMapping("/gio-hang-hoa-don/{idKhachHang}")
    public ResponseEntity<List<GioHangChiTietResponse>> getChiTietGioHangSauThanhToan(@PathVariable Integer idKhachHang) {
        List<GioHangChiTietResponse> gioHangChiTietList = hoaDonOnlineService.getChiTietGioHangSauThanhToan(idKhachHang);
        if (gioHangChiTietList.isEmpty()) {
            return ResponseEntity.noContent().build();
        }

        return ResponseEntity.ok(gioHangChiTietList);
    }

//    //phương thức tính tổng tiền trước voucher
//    @GetMapping("/tinh-tong-tien")
//    public ResponseEntity<Double> getTotalPrice(@RequestParam Integer idKhachHang) {
//        Double totalPrice = hoaDonOnlineService.getTamTinh(idKhachHang);
//        if (totalPrice == null) {
//            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(0.0);
//        }
//        return ResponseEntity.ok(totalPrice);
//    }

    //phương thức load voucher
    @GetMapping("/vouchers/{tongTien}")
    public ResponseEntity<List<VoucherDto>> getAvailableVouchers(@PathVariable Double tongTien) {
        List<VoucherDto> vouchers = hoaDonOnlineService.getVoucherIdAndTen(tongTien);
        return ResponseEntity.ok(vouchers);
    }

//    // Phương thức để tính tổng tiền thanh toán sau khi áp dụng voucher
//    @PostMapping("/tong-tien-thanh-toan")
//    public ResponseEntity<Double> getTotalPrice(
//            @RequestParam Integer idKhachHang,
//            @RequestParam Integer voucherId,
//            @RequestParam Double shippingFee) {
//        Double totalPrice = hoaDonOnlineService.getTongTienThanhToan(idKhachHang, voucherId, shippingFee);
//        return ResponseEntity.ok(totalPrice);
//    }

    // Tạo hóa đơn
    @PostMapping("/create")
    public ResponseEntity<?> createHoaDon(@RequestBody HoaDonOnlineRequest request) {
        try {
            HoaDon hoaDon = hoaDonOnlineService.createHoaDon(request);
            return new ResponseEntity<>(hoaDon, HttpStatus.CREATED);
        }catch (ResponseStatusException ex) {
            return ResponseEntity
                    .status(ex.getStatusCode())
                    .body(Collections.singletonMap("message", ex.getReason()));
        } catch (Exception e) {
            return ResponseEntity
                    .status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Collections.singletonMap("message", "Đã xảy ra lỗi khi cập nhật số lượng."));
        }
    }


    //phương thức load hóa đơn chi tiết
    @GetMapping("/chi-tiet/{idHoaDon}")
    public ResponseEntity<?> getChiTietHoaDon(@PathVariable Integer idHoaDon) {
        try {
            List<HoaDonChiTietDto> chiTietList = hoaDonOnlineService.getHoaDonChiTiet(idHoaDon);
            return ResponseEntity.ok(chiTietList);
        } catch (ResponseStatusException e) {
            return ResponseEntity.status(e.getStatusCode()).body(e.getReason());
        }
    }

    // Lấy lịch sử đơn hàng theo id khách hàng
    @GetMapping("/hoa-don/{idKhachHang}")
    public List<HoaDonDto> getHoaDonByKhachHang(@RequestParam Integer idKhachHang,
                                                @RequestParam(required = false, defaultValue = "0") Integer trangThai) {
        return hoaDonOnlineService.getHoaDonByKhachHang(idKhachHang,trangThai);
    }

    //phương thức load hóa đơn khi xem chi tiết
    @GetMapping("/find-by-ma/{id}")
    public Optional<HoaDon> getHoaDon(@PathVariable("id") Integer id) {
        return hoaDonOnlineService.getHoaDon(id);
    }

    @PostMapping("/huy")
    public ResponseEntity<?> huyHoaDon(@RequestParam Integer idHoaDon,
                                       @RequestParam String ghiChu) {
        try {
            HoaDon hoadon = hoaDonOnlineService.huyHoaDon(idHoaDon, ghiChu);
            return ResponseEntity.ok(hoadon);
        } catch (ResponseStatusException ex) {
            return ResponseEntity
                    .status(ex.getStatusCode())
                    .body(Map.of(
                            "status", ex.getStatusCode().value(),
                            "message", ex.getReason()
                    ));
        }
    }

    //phương thức cập nhật trạng thái cho đơn hàng
    @PostMapping("/{id}/tang-trang-thai")
    public ResponseEntity<?> tangTrangThai(@PathVariable Integer id) {
        try {
            HoaDon updated = hoaDonOnlineService.tangTrangThaiHoaDon(id);
            return ResponseEntity.ok(updated);
        } catch (RuntimeException ex) {
            // Trả về JSON với thông báo lỗi trong trường "message"
            Map<String, String> response = new HashMap<>();
            response.put("message", ex.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(response);
        }
    }

}

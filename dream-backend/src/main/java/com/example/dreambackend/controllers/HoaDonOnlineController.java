package com.example.dreambackend.controllers;

import com.example.dreambackend.dtos.HoaDonChiTietDto;
import com.example.dreambackend.dtos.HoaDonDto;
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
import org.springframework.web.server.ResponseStatusException;

import java.util.List;
import java.util.Optional;

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

    @GetMapping("/vouchers/{tongTien}")
    public ResponseEntity<List<VoucherDto>> getAvailableVouchers(@PathVariable Double tongTien) {
        List<VoucherDto> vouchers = hoaDonOnlineService.getVoucherIdAndTen(tongTien);
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
            @RequestParam(required = false) Integer voucherId,
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
                    idKhachHang, voucherId, tongTienTruocGiam, paymentMethodId, TongTienSauGiam,sdtNguoiNhan,tenNguoiNhan,diaChi,shippingFee );
            return new ResponseEntity<>(hoaDon, HttpStatus.CREATED);
        } catch (Exception e) {
            return new ResponseEntity<>(null, HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    @GetMapping("/chi-tiet/{idHoaDon}")
    public ResponseEntity<?> getChiTietHoaDon(@PathVariable Integer idHoaDon) {
        try {
            List<HoaDonChiTietDto> chiTietList = hoaDonOnlineService.getChiTietHoaDonByMa(idHoaDon);
            return ResponseEntity.ok(chiTietList);
        } catch (ResponseStatusException e) {
            return ResponseEntity.status(e.getStatusCode()).body(e.getReason());
        }
    }

    // Lấy danh sách hóa đơn theo id khách hàng
    @GetMapping("/hoa-don/{idKhachHang}")
    public List<HoaDonDto> getHoaDonByKhachHang(@RequestParam Integer idKhachHang,
                                                @RequestParam(required = false, defaultValue = "0") Integer trangThai) {
        return hoaDonOnlineService.getHoaDonChiTietDto(idKhachHang,trangThai);
    }


    @GetMapping("/find-by-ma/{id}")
    public Optional<HoaDon> getHoaDonWithDetailsByMa(@PathVariable("id") Integer id) {
        return hoaDonOnlineService.getHoaDonWithDetailsByMa(id);
    }
    @PostMapping("/huy")
    public ResponseEntity<HoaDon> huyHoaDon(@RequestParam Integer idHoaDon,
                                            @RequestParam String ghiChu) {
        // Gọi service để hủy đơn, giả sử service trả về hóa đơn đã cập nhật
        HoaDon hoadon = hoaDonOnlineService.huyHoaDon(idHoaDon, ghiChu);

        return ResponseEntity.ok(hoadon);
    }

    @PostMapping("/{id}/tang-trang-thai")
    public ResponseEntity<?> tangTrangThai(@PathVariable Integer id) {
        HoaDon updated = hoaDonOnlineService.tangTrangThaiHoaDon(id);
        if (updated != null) {
            return ResponseEntity.ok(updated); // trả về JSON hóa đơn sau cập nhật
        } else {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body("Hóa đơn không tồn tại");
        }
    }

}

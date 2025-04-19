package com.example.dreambackend.controllers;

import com.example.dreambackend.entities.SanPhamChiTiet;
import com.example.dreambackend.entities.ThuongHieu;
import com.example.dreambackend.entities.Voucher;
import com.example.dreambackend.repositories.HoaDonRepository;
import com.example.dreambackend.security.IsQuanLy;
import com.example.dreambackend.services.sanphamchitiet.SanPhamChiTietService;
import com.example.dreambackend.services.voucher.VoucherService;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;

import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/voucher")
@CrossOrigin(origins = "http://localhost:4200")
public class VoucherController {

    @Autowired
    VoucherService voucherService;

    @Autowired
    HoaDonRepository hoaDonRepository;
    @GetMapping("/hien-thi")
    public ResponseEntity<Page<Voucher>> hienThiPaged(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "8") int size) {
        Page<Voucher> pagedVouchers = voucherService.getAllVoucherPaged(page, size);
        return ResponseEntity.ok(pagedVouchers);
    }

    @PostMapping("/add")
    public ResponseEntity<Voucher> addVoucher(@RequestBody Voucher voucher) {
        System.out.println("Received voucher: " + voucher);
        Voucher savedVoucher = voucherService.addVoucher(voucher);
        return ResponseEntity.ok(savedVoucher);
    }

    @PostMapping("/update")
    public ResponseEntity<?> updateVoucher( @RequestBody Voucher voucher) {
        Voucher updatedVoucher = voucherService.updateVoucher(voucher);
        return ResponseEntity.ok(updatedVoucher);
    }

    @GetMapping("/search")
    public List<Voucher> searchVoucherByName(@RequestParam("ten") String ten) {
        return voucherService.searchVoucherByName(ten);
    }

    @GetMapping("/{id}")
    public ResponseEntity<Voucher> getVoucherDetail(@PathVariable Integer id) {
        try {
            Voucher voucher = voucherService.getVoucherById(id);
            return ResponseEntity.ok(voucher);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(null);
        }

    }
    @GetMapping("/loc-trang-thai")
    public ResponseEntity<Page<Voucher>> findByTrangThai(@RequestParam int trangThai,
                                                         @RequestParam(defaultValue = "0") int page,
                                                         @RequestParam(defaultValue = "8") int size){
        if(trangThai==3){
            Page<Voucher> pagedVouchers = voucherService.getAllVoucherPaged(page, size);
            return ResponseEntity.ok(pagedVouchers);
        }else{
            Page<Voucher> pagedVouchers = voucherService.getAllVoucherByTrangThai(trangThai,page, size);
            return ResponseEntity.ok(pagedVouchers);
        }
    }


    @GetMapping("/voucher/{id}/check-used")
    public ResponseEntity<Boolean> checkIfVoucherUsed(@PathVariable Integer id) {
        boolean isUsed = hoaDonRepository.existsByVoucher_Id(id);
        return ResponseEntity.ok(isUsed);
    }

}

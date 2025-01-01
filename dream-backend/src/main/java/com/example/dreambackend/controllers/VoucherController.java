package com.example.dreambackend.controllers;

import com.example.dreambackend.entities.ThuongHieu;
import com.example.dreambackend.entities.Voucher;
import com.example.dreambackend.services.voucher.VoucherService;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;

import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/voucher")
public class VoucherController {

    @Autowired
    VoucherService voucherService;
    @GetMapping("/hien-thi")
    public ResponseEntity<List<Voucher>> hienThi() {
        List<Voucher> listVC = voucherService.getAllVoucher();
        return ResponseEntity.ok(listVC);
    }
    @PostMapping("/add")
    public ResponseEntity<Voucher> addVoucher(@RequestBody Voucher voucher) {
        Voucher savedVoucher = voucherService.addVoucher(voucher);
        return ResponseEntity.ok(savedVoucher);
    }
    @PostMapping("/update")
    public ResponseEntity<Voucher> updateVoucher(@RequestBody Voucher voucher) {
        Voucher savedVoucher = voucherService.updateVoucher(voucher);
        return ResponseEntity.ok(savedVoucher);
    }
    @GetMapping("/{id}")
    public ResponseEntity<Voucher> getVoucherDetail(@PathVariable Integer id) {
        try {
            Voucher voucher = voucherService.getVoucherById(id);
            return ResponseEntity.ok(voucher);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(null);
        }
    }
}

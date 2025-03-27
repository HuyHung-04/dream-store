package com.example.dreambackend.controllers;

import com.example.dreambackend.services.payment.VNPayService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/vnpay")
@CrossOrigin(origins = "http://localhost:4201")
public class VNPayController {
    @Autowired
    private VNPayService vnPayService;

    @GetMapping("/createPay")
    public ResponseEntity<?> createPay(@RequestParam long amount) throws Exception {
        return ResponseEntity.ok().body(vnPayService.createVnPayPayment(amount));
    }
}

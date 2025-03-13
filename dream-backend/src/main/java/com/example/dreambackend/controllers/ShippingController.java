package com.example.dreambackend.controllers;

import com.example.dreambackend.dtos.ShippingFeeRequest;
import com.example.dreambackend.services.phivanchuyen.ShippingFeeService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.io.UnsupportedEncodingException;

@RestController
@RequestMapping("/api")
@CrossOrigin(origins = "http://localhost:4201")
public class ShippingController {
    @Autowired
    ShippingFeeService shippingFeeService;

    public ShippingController(ShippingFeeService shippingFeeService) {
        this.shippingFeeService = shippingFeeService;
    }

    @PostMapping("/services/shipment/fee")
    public ResponseEntity<String> getShippingFee(@RequestBody ShippingFeeRequest request) {
        return shippingFeeService.calculateShippingFee(request);
    }
}

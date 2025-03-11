package com.example.dreambackend.controllers;

import com.example.dreambackend.requests.HoaDonRequest;
import com.example.dreambackend.requests.HoaDonSearchRequest;
import com.example.dreambackend.responses.HoaDonResponse;
import com.example.dreambackend.services.hoadon.IHoaDonService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;


@RestController
@CrossOrigin(origins = "http://localhost:4200")
@RequestMapping("/api/hoa-don")
public class HoaDonController {

    @Autowired
    private IHoaDonService hoaDonService;

    @PostMapping("/create")
    public ResponseEntity<?> createHoaDon(@RequestBody HoaDonRequest request) {
        try {
            HoaDonResponse response = hoaDonService.createHoaDon(request);
            return ResponseEntity.ok(response);
        } catch (RuntimeException e) {
            // Đảm bảo phản hồi luôn là JSON hợp lệ
            Map<String, String> errorResponse = new HashMap<>();
            errorResponse.put("error", e.getMessage());
            return ResponseEntity.badRequest().body(errorResponse);
        }
    }


    @PutMapping("/{id}/update")
    public ResponseEntity<?> updateHoaDon(@PathVariable Integer id, @RequestBody HoaDonRequest request) {
        try {
            HoaDonResponse response = hoaDonService.updateHoaDon(id, request);
            return ResponseEntity.ok(response);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @PostMapping("/all")
    public ResponseEntity<List<HoaDonResponse>> getAllHoaDon(
            @RequestBody HoaDonSearchRequest request
    ) {
        List<HoaDonResponse> response = hoaDonService.getAllHoaDon(request);
        return ResponseEntity.ok(response);
    }
}


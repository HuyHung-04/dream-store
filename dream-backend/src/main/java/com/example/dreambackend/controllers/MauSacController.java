package com.example.dreambackend.controllers;

import com.example.dreambackend.requests.MauSacRequest;
import com.example.dreambackend.responses.MauSacRepone;
import com.example.dreambackend.services.mausac.MauSacService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.BindingResult;
import org.springframework.validation.FieldError;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/mau-sac")
// cho phép các request Angular truy cập vào các API
@CrossOrigin(origins = {"http://localhost:4200", "http://localhost:4201"})
public class MauSacController {
    @Autowired
    MauSacService mauSacService;
    @GetMapping("hien-thi")
    public ResponseEntity<List<MauSacRepone>> hienthi() {
        List<MauSacRepone> listMauSac = mauSacService.getAllMauSac();
        return ResponseEntity.ok(listMauSac);
    }

    @PostMapping("/add")
    public ResponseEntity<?> add(@Valid @RequestBody MauSacRequest mauSacRequest, BindingResult result) {
        if (result.hasErrors()) {
            Map<String, String> errors = new HashMap<>();
            for (FieldError error : result.getFieldErrors()) {
                errors.put(error.getField(), error.getDefaultMessage());
            }
            return ResponseEntity.badRequest().body(errors);
        }
        mauSacService.addMauSac(mauSacRequest);
        Map<String, String> response = new HashMap<>();
        response.put("message", "Thêm thành công");
        return ResponseEntity.ok(response);
    }

    @PutMapping("/update-trang-thai")
    public ResponseEntity<?> update(@RequestBody MauSacRequest mauSacRequest) {
        mauSacService.updateTrangThaiMauSac(mauSacRequest);
        Map<String, String> response = new HashMap<>();
        response.put("message", "Cập nhật trạng thái thành công");
        return ResponseEntity.ok(response);

    }
}

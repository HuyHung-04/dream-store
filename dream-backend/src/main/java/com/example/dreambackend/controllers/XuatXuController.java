package com.example.dreambackend.controllers;
import com.example.dreambackend.requests.SizeRequest;
import com.example.dreambackend.requests.XuatXuRequest;
import com.example.dreambackend.responses.XuatXuRespone;
import com.example.dreambackend.services.xuatxu.XuatXuService;
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
@RequestMapping("/api/xuat-xu")
// cho phép các request Angular truy cập vào các API
@CrossOrigin(origins = {"http://localhost:4200", "http://localhost:4201"})
public class XuatXuController {
    @Autowired
    XuatXuService xuatXuService;

    @GetMapping("/hien-thi")
    public ResponseEntity<List<XuatXuRespone>> hienThi() {
        List<XuatXuRespone> listXuatXu = xuatXuService.getAllXuatXu();
        return ResponseEntity.ok(listXuatXu);
    }

    @PostMapping("/add")
    public ResponseEntity<?> add(@Valid @RequestBody XuatXuRequest xuatXuRequest, BindingResult result) {
        if (result.hasErrors()) {
            Map<String, String> errors = new HashMap<>();
            for (FieldError error : result.getFieldErrors()) {
                errors.put(error.getField(), error.getDefaultMessage());
            }
            return ResponseEntity.badRequest().body(errors);
        }
        xuatXuService.addXuatXu(xuatXuRequest);
        Map<String, String> response = new HashMap<>();
        response.put("message", "Thêm thành công");
        return ResponseEntity.ok(response);
    }

    @PutMapping("/update-trang-thai")
    public ResponseEntity<?> updateTrangThai(@RequestBody XuatXuRequest request) {
        xuatXuService.updateTrangThaiXuatXu(request);
        Map<String, String> response = new HashMap<>();
        response.put("message", "Cập nhật trạng thái thành công");
        return ResponseEntity.ok(response);
    }
}

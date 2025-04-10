package com.example.dreambackend.controllers;
import com.example.dreambackend.requests.ThuongHieuRequest;
import com.example.dreambackend.responses.ThuongHieuRespone;
import com.example.dreambackend.services.thuonghieu.ThuongHieuService;
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
@RequestMapping("/api/thuong-hieu")
// cho phép các request Angular truy cập vào các API
@CrossOrigin(origins = {"http://localhost:4200", "http://localhost:4201"})
public class ThuongHieuController {
    @Autowired
    ThuongHieuService thuongHieuService;

    @GetMapping("/hien-thi")
    public ResponseEntity<List<ThuongHieuRespone>> hienThi() {
        List<ThuongHieuRespone> listThuongHieu = thuongHieuService.getAllThuongHieu();
        return ResponseEntity.ok(listThuongHieu);
    }

    @PostMapping("/add")
    public ResponseEntity<?> add(@Valid @RequestBody ThuongHieuRequest thuongHieuRequest, BindingResult result) {
        if (result.hasErrors()) {
            Map<String, String> errors = new HashMap<>();
            for (FieldError error : result.getFieldErrors()) {
                errors.put(error.getField(), error.getDefaultMessage());
            }
            return ResponseEntity.badRequest().body(errors);
        }
        thuongHieuService.addThuongHieu(thuongHieuRequest);
        Map<String, String> response = new HashMap<>();
        response.put("message", "Thêm thành công");
        return ResponseEntity.ok(response);
    }

    @PutMapping("/update-trang-thai")
    public ResponseEntity<?> update(@RequestBody ThuongHieuRequest thuongHieuRequest) {
        thuongHieuService.updateTrangThaiThuongHieu(thuongHieuRequest);
        Map<String, String> response = new HashMap<>();
        response.put("message", "Cập nhật trạng thái thành công");
        return ResponseEntity.ok(response);

    }
}

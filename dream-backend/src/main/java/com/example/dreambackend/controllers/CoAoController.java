package com.example.dreambackend.controllers;

import com.example.dreambackend.requests.CoAoRequest;
import com.example.dreambackend.responses.CoAoRespone;
import com.example.dreambackend.services.coao.CoAoService;
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
@RequestMapping("/api/co-ao")
// cho phép các request Angular truy cập vào các API
@CrossOrigin(origins = {"http://localhost:4200", "http://localhost:4201"})
public class CoAoController {
    @Autowired
    CoAoService coAoService;

    @GetMapping("/hien-thi")
    public ResponseEntity<List<CoAoRespone>> hienThi() {
        List<CoAoRespone> listCoAo = coAoService.getAllCoAo();
        return ResponseEntity.ok(listCoAo);
    }

    @PostMapping("/add")
    public ResponseEntity<?> add(@Valid @RequestBody CoAoRequest coAoRequest, BindingResult result) {
        if (result.hasErrors()) {
            Map<String, String> errors = new HashMap<>();
            for (FieldError error : result.getFieldErrors()) {
                errors.put(error.getField(), error.getDefaultMessage());
            }
            return ResponseEntity.badRequest().body(errors);
        }

        coAoService.addCoAo(coAoRequest);
        Map<String, String> response = new HashMap<>();
        response.put("message", "Thêm thành công");
        return ResponseEntity.ok(response);
    }

    @PutMapping("/update-trang-thai")
    public ResponseEntity<?> update(@RequestBody CoAoRequest coAoRequest) {
        coAoService.updateTrangThaiCoAo(coAoRequest);
        Map<String, String> response = new HashMap<>();
        response.put("message", "Cập nhật trạng thái thành công");
        return ResponseEntity.ok(response);
    }
}

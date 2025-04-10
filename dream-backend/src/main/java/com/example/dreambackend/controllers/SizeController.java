package com.example.dreambackend.controllers;

import com.example.dreambackend.requests.SizeRequest;
import com.example.dreambackend.responses.SizeRespone;
import com.example.dreambackend.services.chatlieu.ChatLieuService;
import com.example.dreambackend.services.coao.CoAoService;
import com.example.dreambackend.services.mausac.MauSacService;
import com.example.dreambackend.services.size.SizeService;
import com.example.dreambackend.services.thuonghieu.ThuongHieuService;
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
@RequestMapping("api/size")
// cho phép các request Angular truy cập vào các API
@CrossOrigin(origins = {"http://localhost:4200", "http://localhost:4201"})
public class SizeController {
    @Autowired
    SizeService sizeService;
    @Autowired
    ThuongHieuService thuongHieuService;
    @Autowired
    MauSacService mauSacService;
    @Autowired
    CoAoService coAoService;
    @Autowired
    ChatLieuService chatLieuService;
    @Autowired
    XuatXuService xuatXuService;
    @GetMapping("/hien-thi")
    public ResponseEntity<List<SizeRespone>> hienThi() {
        List<SizeRespone> listSize = sizeService.getAllSize();
        return ResponseEntity.ok(listSize);
    }

    @PostMapping("/add")
    public ResponseEntity<?> add(@Valid @RequestBody SizeRequest sizeRequest, BindingResult result) {
        // Kiểm tra lỗi validation
        if (result.hasErrors()) {
            Map<String, String> errors = new HashMap<>();
            for (FieldError error : result.getFieldErrors()) {
                errors.put(error.getField(), error.getDefaultMessage());
            }
            return ResponseEntity.badRequest().body(errors);
        }
        sizeService.addSize(sizeRequest);

        Map<String, String> response = new HashMap<>();
        response.put("message", "Thêm thành công");
        return ResponseEntity.ok(response);
    }


    @PutMapping("/update-trang-thai")
    public ResponseEntity<?> updateTrangThai(@RequestBody SizeRequest request) {
        sizeService.updateTrangThaiSize(request);
        Map<String, String> response = new HashMap<>();
        response.put("message", "Cập nhật trạng thái thành công");
        return ResponseEntity.ok(response);

    }


    @GetMapping("/check-ten-exists")
    public ResponseEntity<Boolean> checkTenExists(@RequestParam String ten, @RequestParam String loai) {
        boolean exists = false;
        switch (loai) {
            case "thuongHieu":
                exists = thuongHieuService.existsThuongHieu(ten);
                break;
            case "chatLieu":
                exists = chatLieuService.existsChatLieu(ten);
                break;
            case "coAo":
                exists = coAoService.existsCoAo(ten);
                break;
            case "mauSac":
                exists = mauSacService.existsMau(ten);
                break;
            case "size":
                exists = sizeService.existsSize(ten);
                break;
            case "xuatXu":
                exists = xuatXuService.existsXuatXu(ten);
                break;
        }
        return ResponseEntity.ok(exists);
    }

}
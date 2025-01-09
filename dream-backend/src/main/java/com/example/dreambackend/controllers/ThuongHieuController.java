package com.example.dreambackend.controllers;
import com.example.dreambackend.dtos.ThuongHieuDto;
import com.example.dreambackend.entities.ThuongHieu;
import com.example.dreambackend.services.thuonghieu.ThuongHieuService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/thuong-hieu")
// cho phép các request Angular truy cập vào các API
@CrossOrigin(origins = "http://localhost:4200")
public class ThuongHieuController {
    @Autowired
    ThuongHieuService thuongHieuService;

    @GetMapping("/hien-thi")
    public ResponseEntity<List<ThuongHieu>> hienThi() {
        List<ThuongHieu> listThuongHieu = thuongHieuService.getAllThuongHieu();
        return ResponseEntity.ok(listThuongHieu);
    }

    @PostMapping("/add")
    public ResponseEntity<?> add(@RequestBody ThuongHieuDto thuongHieuDto) {
        thuongHieuService.addThuongHieu(thuongHieuDto);
        return ResponseEntity.ok("Thêm thành công");
    }
}

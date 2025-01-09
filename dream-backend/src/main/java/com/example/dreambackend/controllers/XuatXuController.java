package com.example.dreambackend.controllers;
import com.example.dreambackend.dtos.XuatXuDto;
import com.example.dreambackend.entities.XuatXu;
import com.example.dreambackend.services.xuatxu.XuatXuService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
@RestController
@RequestMapping("/api/xuat-xu")
// cho phép các request Angular truy cập vào các API
@CrossOrigin(origins = "http://localhost:4200")
public class XuatXuController {
    @Autowired
    XuatXuService xuatXuService;

    @GetMapping("/hien-thi")
    public ResponseEntity<List<XuatXu>> hienThi() {
        List<XuatXu> listXuatXu = xuatXuService.getAllXuatXu();
        return ResponseEntity.ok(listXuatXu);
    }

    @PostMapping("/add")
    public ResponseEntity<?> add(@RequestBody XuatXuDto xuatXuDto) {
        xuatXuService.addXuatXu(xuatXuDto);
        return ResponseEntity.ok("Thêm thành công");
    }
}

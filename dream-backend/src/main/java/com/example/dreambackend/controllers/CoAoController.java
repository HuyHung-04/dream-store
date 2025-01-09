package com.example.dreambackend.controllers;

import com.example.dreambackend.dtos.CoAoDto;
import com.example.dreambackend.entities.CoAo;
import com.example.dreambackend.services.coao.CoAoService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/co-ao")
@CrossOrigin(origins = "http://localhost:4200")
// cho phép các request Angular truy cập vào các API
public class CoAoController {
    @Autowired
    CoAoService coAoService;

    @GetMapping("/hien-thi")
    public ResponseEntity<List<CoAo>> hienThi() {
        List<CoAo> listCoAo = coAoService.getAllCoAo();
        return ResponseEntity.ok(listCoAo);
    }

    @PostMapping("/add")
    public ResponseEntity<?> add(@RequestBody CoAoDto coAoDto) {
        coAoService.addCoAo(coAoDto);
        return ResponseEntity.ok("Thêm thành công");
    }
}

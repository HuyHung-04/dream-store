package com.example.dreambackend.controllers;

import com.example.dreambackend.dtos.HoaDonChiTietDTO;
import com.example.dreambackend.entities.HoaDonChiTiet;
import com.example.dreambackend.responses.ResponseObject;
import com.example.dreambackend.services.hoadonchitiet.HoaDonChiTietService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/hoa-don-chi-tiet")
@RequiredArgsConstructor
public class HoaDonChiTietController {

    private final HoaDonChiTietService hoaDonChiTietService;

    @GetMapping
    public ResponseEntity<ResponseObject> hoaDonChiTiet() {
        List<HoaDonChiTiet> lstHDCT = hoaDonChiTietService.getAllHoaDonChiTiet();
        return ResponseEntity.ok().body(ResponseObject.builder()
                        .message("Successfully")
                        .status(HttpStatus.OK)
                        .data(lstHDCT)
                .build());
    }

    @PostMapping("/create")
    public ResponseEntity<ResponseObject> createHDCT(@RequestBody HoaDonChiTietDTO hoaDonChiTietDTO) {
        hoaDonChiTietService.createHoaDonChiTiet(hoaDonChiTietDTO);
        return ResponseEntity.ok().body(ResponseObject.builder()
                        .message("Successfully")
                        .status(HttpStatus.OK)
                        .data(hoaDonChiTietDTO)
                .build());
    }

    @PutMapping("/update/{id}")
    public ResponseEntity<ResponseObject> updateHDCT(
            @PathVariable("id") int id,
            @RequestBody HoaDonChiTietDTO hoaDonChiTietDTO
    ) {
        hoaDonChiTietService.updateHoaDonChiTiet(id, hoaDonChiTietDTO);
        return ResponseEntity.ok().body(ResponseObject.builder()
                        .message("Successfully")
                        .status(HttpStatus.OK)
                        .data(hoaDonChiTietDTO)
                .build());
    }

    @GetMapping("/hoa-don/{id}")
    public ResponseEntity<ResponseObject> hoaDon(@PathVariable("id") int id) {
        List<HoaDonChiTiet> list =  hoaDonChiTietService.getHoaDonChiTietByHoaDonId(id);
        return ResponseEntity.ok().body(ResponseObject.builder()
                        .message("Successfully")
                        .status(HttpStatus.OK)
                        .data(list)
                .build());
    }
}

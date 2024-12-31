package com.example.dreambackend.controllers;

import com.example.dreambackend.dtos.HoaDonDTO;
import com.example.dreambackend.entities.HoaDon;
import com.example.dreambackend.responses.ResponseObject;
import com.example.dreambackend.services.hoadon.HoaDonService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/hoa-don")
public class HoaDonController {
    @Autowired
    HoaDonService hoaDonService;

    @GetMapping("/{id}")
    public ResponseEntity<ResponseObject> getHoaDon(@PathVariable("id") int id) {
        HoaDon hoaDon = hoaDonService.getHoaDonById(id);
        return ResponseEntity.ok().body(ResponseObject.builder()
                        .message("Successfully")
                        .status(HttpStatus.OK)
                        .data(hoaDon)
                .build());
    }

    @GetMapping("")
    public ResponseEntity<ResponseObject> getAllHoaDon(
            @RequestParam("page") int page,
            @RequestParam("limit") int limit
    ) {
        List<HoaDon> lsthd = hoaDonService.getListHoaDon();
        return ResponseEntity.ok().body(ResponseObject.builder()
                        .message("Successfully")
                        .status(HttpStatus.OK)
                        .data(lsthd)
                .build());
    }

    @PostMapping("/create")
    public ResponseEntity<ResponseObject> createHoaDon(@RequestBody HoaDonDTO hoaDonDTO) throws Exception {
        HoaDon hoaDon = hoaDonService.createHoaDon(hoaDonDTO);
        return ResponseEntity.ok().body(ResponseObject.builder()
                        .message("Successfully")
                        .status(HttpStatus.OK)
                        .data(hoaDon)
                .build());
    }
}

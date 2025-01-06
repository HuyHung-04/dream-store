package com.example.dreambackend.controllers;

import com.example.dreambackend.dtos.GioHangDTO;
import com.example.dreambackend.entities.GioHang;
import com.example.dreambackend.responses.ResponseObject;
import com.example.dreambackend.services.GioHang.GioHangService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/gio-hang")
@RequiredArgsConstructor
public class GioHangController {

    private final GioHangService gioHangService;

    @GetMapping("/{id}")
    public ResponseEntity<ResponseObject> getGioHangByIdKhachHang(@PathVariable int id) {
        List<GioHang> lstGioHang= gioHangService.getGioHangByIdKhachHang(id);
        return ResponseEntity.ok(ResponseObject.builder()
                        .message("Success")
                        .status(HttpStatus.OK)
                        .data(lstGioHang)
                .build());
    }

    @GetMapping
    public Page<GioHang> getAllGioHang(
            @RequestParam("page") int page,
            @RequestParam("limit") int limit
    ) {
        Pageable pageable = PageRequest.of(page, limit);
        return gioHangService.getAllGioHang(pageable);
    }

    @DeleteMapping("/delete/{id}")
    public ResponseEntity<ResponseObject> deleteGioHangById(@PathVariable int id) {
        gioHangService.deleteGioHangByIdKhachHang(id);
        return ResponseEntity.ok().body(ResponseObject.builder()
                        .data(null)
                        .status(HttpStatus.OK)
                        .message("GioHang deleted")
                .build());
    }

    @PostMapping("/create")
    public ResponseEntity<ResponseObject> createGioHang(@RequestBody GioHangDTO gioHangDTO) {
        gioHangService.createGioHang(gioHangDTO);
        return ResponseEntity.ok().body(ResponseObject.builder()
                        .message("GioHang created")
                        .status(HttpStatus.CREATED)
                        .data(null)
                .build());
    }

    @PutMapping("/update/{id}")
    public ResponseEntity<ResponseObject> updateGioHang(
            @PathVariable("id") Integer id,
            @RequestBody GioHangDTO gioHangDTO
    ) {
        gioHangService.updateGioHang(id,gioHangDTO);
        return ResponseEntity.ok().body(ResponseObject.builder()
                        .message("GioHang updated")
                        .status(HttpStatus.OK)
                        .data(null)
                .build());
    }
}

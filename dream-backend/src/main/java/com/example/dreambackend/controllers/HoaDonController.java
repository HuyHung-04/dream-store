package com.example.dreambackend.controllers;

import com.example.dreambackend.dtos.HoaDonDTO;
import com.example.dreambackend.entities.HoaDon;
import com.example.dreambackend.responses.ResponseObject;
import com.example.dreambackend.services.hoadon.HoaDonService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.format.annotation.DateTimeFormat;
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
    public ResponseEntity<ResponseObject> getHoaDonById(@PathVariable("id") int id) {
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
        Pageable pageable = PageRequest.of(page, limit);
        Page<HoaDon> lsthd = hoaDonService.getListHoaDon(pageable);
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

    @GetMapping("/khach-hang/{id}")
    public ResponseEntity<ResponseObject> getHoaDonByKhachId(@PathVariable("id") int id) {
        List<HoaDon> listHoaDon = hoaDonService.findHoaDonByKhachHangId(id);
        return ResponseEntity.ok().body(ResponseObject.builder()
                        .message("Successfully")
                        .status(HttpStatus.OK)
                        .data(listHoaDon)
                .build());
    }


    @GetMapping("/loc")
    public ResponseEntity<ResponseObject> getHoaDonByLoc(
            @RequestParam(required = false) String search1,
            @RequestParam(required = false) String search2,
            @RequestParam(required = false) String combo1,
            @RequestParam(required = false) String combo2,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) String fromDate,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) String toDate
    ) {
        List<HoaDon> fileteredData = hoaDonService.findFilteredHoaDon(search1, search2, combo1, combo2, fromDate, toDate);
        return ResponseEntity.ok().body(ResponseObject.builder()
                        .message("Successfully")
                        .status(HttpStatus.OK)
                        .data(fileteredData)
                .build());
    }
}

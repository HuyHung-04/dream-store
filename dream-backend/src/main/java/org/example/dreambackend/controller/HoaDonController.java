package org.example.dreambackend.controller;

import org.example.dreambackend.dtos.HoaDonDTO;
import org.example.dreambackend.entities.HoaDon;
import org.example.dreambackend.services.hoadon.HoaDonService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/hoa-don")
public class HoaDonController {
    @Autowired
    HoaDonService hoaDonService;

    @GetMapping("/{id}")
    public HoaDonDTO getHoaDon(@PathVariable int id) {
        return hoaDonService.getHoaDonById(id);
    }

    @GetMapping("")
    public List<HoaDonDTO> getAllHoaDon() {
        return hoaDonService.getListHoaDon();
    }

    @GetMapping("/create")
    public String createHoaDon(@RequestBody HoaDonDTO hoaDonDTO) {
        HoaDon hoaDon = hoaDonService.createHoaDon(hoaDonDTO);
        return hoaDon.toString();
    }
}

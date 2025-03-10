package com.example.dreambackend.controllers;

import com.example.dreambackend.dtos.SanPhamChiTietDto;
import com.example.dreambackend.dtos.SanPhamChiTietOnlineDto;
import com.example.dreambackend.dtos.SanPhamDto;
import com.example.dreambackend.repositories.SanPhamChiTietOnlineRepository;
import com.example.dreambackend.responses.ThanhToanDonHangOnlineRespone;
import com.example.dreambackend.services.giohangchitiet.GioHangChiTietService;
import com.example.dreambackend.services.sanphamonline.SanPhamOnlineService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Configuration;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/ban-hang-online")
@CrossOrigin(origins = "http://localhost:4201")
public class BanHangOnlineController {
    @Autowired
    SanPhamOnlineService sanPhamOnlineService;

    @Autowired
    SanPhamChiTietOnlineRepository chiTietOnlineRepository;
    @GetMapping("/hien-thi")
    public ResponseEntity<Page<SanPhamDto>> hienThi(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        Pageable pageable = PageRequest.of(page, size, Sort.by("id").descending());
        Page<SanPhamDto> sanPhamDtos = sanPhamOnlineService.getSanPhamOnline(pageable);
        return ResponseEntity.ok(sanPhamDtos);
    }

    @GetMapping("hien-thi-spct/{idSanPham}")
    public ResponseEntity<List<SanPhamChiTietOnlineDto>> getSanPhamChiTiet(@PathVariable Integer idSanPham) {
        List<SanPhamChiTietOnlineDto> danhSachSanPhamChiTiet = sanPhamOnlineService.getSanPhamChiTiet(idSanPham);
        return ResponseEntity.ok(danhSachSanPhamChiTiet);
    }

    // API tìm kiếm sản phẩm theo tên và trạng thái là 1 (đang bán)
    @GetMapping("/search")
    public ResponseEntity<Page<SanPhamDto>> searchSanPham(
            @RequestParam("name") String name,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        // Tạo đối tượng Pageable với tham số phân trang và sắp xếp
        Pageable pageable = PageRequest.of(page, size, Sort.by("id").descending());

        // Gọi service để tìm kiếm sản phẩm với tên và trạng thái là 1 (đang bán)
        Page<SanPhamDto> sanPhamDtos = sanPhamOnlineService.searchSanPhamByNameAndTrangThai(name,  pageable);

        return ResponseEntity.ok(sanPhamDtos);
    }

}

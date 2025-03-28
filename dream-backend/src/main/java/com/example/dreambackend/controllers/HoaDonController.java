package com.example.dreambackend.controllers;

import com.example.dreambackend.dtos.DataTableResults;
import com.example.dreambackend.entities.HoaDon;
import com.example.dreambackend.requests.HoaDonRequest;
import com.example.dreambackend.requests.HoaDonSearchRequest;
import com.example.dreambackend.responses.HoaDonResponse;
import com.example.dreambackend.services.hoadon.IHoaDonService;
import com.example.dreambackend.services.pdf.PdfService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;


@RestController
@CrossOrigin(origins = "http://localhost:4200")
@RequestMapping("/api/hoa-don")
public class HoaDonController {

    @Autowired
    private IHoaDonService hoaDonService;
    @Autowired
    private PdfService pdfService;

    @PostMapping("/create")
    public ResponseEntity<?> createHoaDon(@RequestBody HoaDonRequest request) {
        try {
            HoaDonResponse response = hoaDonService.createHoaDon(request);
            return ResponseEntity.ok(response);
        } catch (RuntimeException e) {
            Map<String, String> errorResponse = new HashMap<>();
            errorResponse.put("error", e.getMessage());
            return ResponseEntity.badRequest().body(errorResponse);
        }
    }
    @PutMapping("/{id}/update")
    public ResponseEntity<?> updateHoaDon(@PathVariable Integer id, @RequestBody HoaDonRequest request) {
        try {
            HoaDonResponse response = hoaDonService.updateHoaDon(id, request);
            return ResponseEntity.ok(response);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @PostMapping("/all")
    public DataTableResults<HoaDonResponse> getAllHoaDon(
            @RequestBody HoaDonSearchRequest request
    ) {
        return hoaDonService.getAllHoaDon(request);
    }

    @PostMapping("/{id}/cancel")
    public ResponseEntity<Void> deleteHoaDon(
            @PathVariable Integer id,
            @RequestParam(required = false) String ghiChu
    ) {
        hoaDonService.cancelHoaDon(id,ghiChu);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/{id}")
    public ResponseEntity<HoaDonResponse> getHoaDon(@PathVariable Integer id) {
        HoaDonResponse response = hoaDonService.findById(id);
        return ResponseEntity.ok(response);
    }

    // API xuất hóa đơn PDF
    @GetMapping("/{id}/export-pdf")
    public ResponseEntity<byte[]> exportHoaDonPdf(@PathVariable Integer id) {
        try {
            byte[] pdfBytes = pdfService.generateInvoicePdf(id);

            HttpHeaders headers = new HttpHeaders();
            headers.add("Content-Disposition", "attachment; filename=hoadon_" + id + ".pdf");
            headers.add("Content-Type", "application/pdf");

            return new ResponseEntity<>(pdfBytes, headers, HttpStatus.OK);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(("Lỗi khi xuất PDF: " + e.getMessage()).getBytes());
        }
    }

    @GetMapping("/filter")
    public Page<HoaDon> getHoaDonsByTrangThaiAndNguoiNhanAndMa(
            @RequestParam(defaultValue = "0") Integer trangThai,  // Trạng thái mặc định là 0 (Tất cả)
            @RequestParam(defaultValue = "") String tenNguoiNhan, // Tìm kiếm tên người nhận
            @RequestParam(defaultValue = "") String sdtNguoiNhan, // Tìm kiếm số điện thoại người nhận
            @RequestParam(defaultValue = "") String maHoaDon,  // Tìm kiếm mã hóa đơn
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        return hoaDonService.getHoaDonsByTrangThaiAndNguoiNhanAndMa(trangThai, tenNguoiNhan, sdtNguoiNhan, maHoaDon, page, size);
    }
}
package com.example.dreambackend.controllers;

import com.example.dreambackend.dtos.DataTableResults;
import com.example.dreambackend.dtos.SanPhamThieuDto;
import com.example.dreambackend.entities.HoaDon;
import com.example.dreambackend.entities.NhanVien;
import com.example.dreambackend.repositories.HoaDonRepository;
import com.example.dreambackend.repositories.NhanVienRepository;
import com.example.dreambackend.requests.HoaDonRequest;
import com.example.dreambackend.requests.HoaDonSearchRequest;
import com.example.dreambackend.responses.HoaDonResponse;
import com.example.dreambackend.services.hoadon.HoaDonService;
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

    @Autowired
    NhanVienRepository nhanVienRepository;

    @Autowired
    HoaDonRepository hoaDonRepository;
    @Autowired
    HoaDonService hoaDonService1;

    @GetMapping("/hien-thi-ban-hang")
    public List<NhanVien> getAllNhanVienExcept(@RequestParam(value = "excludeId", required = false) Integer excludeId) {
        if (excludeId == null) {
            // Nếu excludeId là null, trả về toàn bộ danh sách nhân viên
            return nhanVienRepository.findAll();
        } else {
            // Nếu excludeId không phải null, trả về danh sách nhân viên ngoại trừ nhân viên có id là excludeId
            return nhanVienRepository.findByIdNot(excludeId);
        }
    }

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
            Map<String, String> error = new HashMap<>();
            error.put("error", e.getMessage());
            return ResponseEntity.badRequest().body(error);

        }
    }

    @PostMapping("/all")
    public DataTableResults<HoaDonResponse> getAllHoaDon(
            @RequestBody HoaDonSearchRequest request,
            @RequestParam(required = false) Integer idNhanVien
    ) {
        return hoaDonService.getAllHoaDon(request,idNhanVien);
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
            @RequestParam(defaultValue = "0") Integer trangThai,
            @RequestParam(defaultValue = "") String tenNguoiNhan,
            @RequestParam(defaultValue = "") String sdtNguoiNhan,
            @RequestParam(defaultValue = "") String maHoaDon,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "6") int size) {
        return hoaDonService.getHoaDonsByTrangThaiAndNguoiNhanAndMa(trangThai, tenNguoiNhan, sdtNguoiNhan, maHoaDon, page, size);
    }

    @GetMapping("/nhanvien/{id}")
    public List<HoaDon> getHoaDonByNhanVien(@PathVariable("id") Integer idNhanVien) {
        return hoaDonRepository.findByTrangThaiAndNhanVienId(6,idNhanVien);
    }

    @DeleteMapping("/delete-hoadon-nhanvien/{idNhanVien}")
    public ResponseEntity<?> deleteHoaDonsByNhanVienId(@PathVariable Integer idNhanVien) {
        String result = hoaDonService.cancelHoaDonsByNhanVienId(idNhanVien);
        return ResponseEntity.ok(result);
    }

    @PutMapping("/assign")
    public ResponseEntity<Map<String, String>> assignHoaDonToNewNhanVien(
            @RequestParam("from") Integer idNhanVienCu,
            @RequestParam("to") Integer idNhanVienMoi) {
        Map<String, String> response = new HashMap<>();
        try {
            String message = hoaDonService.assignHoaDonToNewNhanVien(idNhanVienCu, idNhanVienMoi);
            response.put("message", message);
            return ResponseEntity.ok(response);
        } catch (RuntimeException e) {
            response.put("error", e.getMessage());
            return ResponseEntity.badRequest().body(response);
        }
    }

    @GetMapping("/san-pham-thieu")
    public ResponseEntity<List<SanPhamThieuDto>> getSanPhamTrongDonChuaXacNhan() {
        List<SanPhamThieuDto> result = hoaDonService1.getSanPhamThieu();
        return ResponseEntity.ok(result);
    }

}
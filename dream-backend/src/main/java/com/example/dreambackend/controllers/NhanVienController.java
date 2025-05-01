package com.example.dreambackend.controllers;

import com.example.dreambackend.entities.NhanVien;
import com.example.dreambackend.services.nhanvien.NhanVienService;
import org.springframework.core.io.Resource;
import org.springframework.core.io.UrlResource;
import org.springframework.beans.factory.annotation.Autowired;

import org.springframework.data.domain.Page;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.File;
import java.io.IOException;
import java.net.MalformedURLException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.List;

@RestController
@RequestMapping("/api/nhan-vien")
@CrossOrigin(origins = "http://localhost:4200")
public class NhanVienController {

    @Autowired
    private NhanVienService nhanVienService;
    // Hiển thị danh sách nhân viên có phân trang

    @GetMapping("/hien-thi")
    public ResponseEntity<Page<NhanVien>> hienThiPaged(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "8") int size,
            @RequestParam(required = false) Integer idNhanVien) { // Thêm idNhanVien vào tham số

        Page<NhanVien> pagedNhanViens = nhanVienService.getAllNhanVienPaged(page, size,idNhanVien);

        return ResponseEntity.ok(pagedNhanViens);
    }

    // API thêm nhân viên
    @PostMapping("/add")
    public ResponseEntity<NhanVien> addNhanVien(@RequestBody NhanVien nhanVien) {
        NhanVien createdNhanVien = nhanVienService.addNhanVien(nhanVien);
        return new ResponseEntity<>(createdNhanVien, HttpStatus.CREATED);
    }

    // API thêm ảnh cho nhân viên

    @PostMapping(value = "/add-image/{id}",consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<NhanVien> addImageForNhanVien(@PathVariable Integer id, @RequestParam("file") MultipartFile file) throws IOException {
        NhanVien updatedNhanVien = nhanVienService.addImageForNhanVien(id, file);
        return new ResponseEntity<>(updatedNhanVien, HttpStatus.OK);
    }

    // Cập nhật nhân viên

    @PostMapping("/update")
    public ResponseEntity<NhanVien> updateNhanVien(@RequestBody NhanVien nhanVien) {
        NhanVien updatedNhanVien = nhanVienService.updateNhanVien(nhanVien);
        return ResponseEntity.ok(updatedNhanVien);
    }

    @GetMapping("/search")
    public ResponseEntity<Page<NhanVien>> searchNhanVien(
            @RequestParam(required = false) String ten,
            @RequestParam(required = false) Integer trangThai,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "8") int size) {

        Page<NhanVien> result = nhanVienService.searchNhanVienByNameAndTrangThai(ten, trangThai, page, size);
        return ResponseEntity.ok(result);
    }

    // Lấy chi tiết nhân viên theo id
    @GetMapping("/{id}")
    public ResponseEntity<NhanVien> getNhanVienDetail(@PathVariable Integer id) {
        try {
            NhanVien nhanVien = nhanVienService.getNhanVienById(id);
            return ResponseEntity.ok(nhanVien);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(null);
        }
    }
    private static final String UPLOAD_DIR = "D:/dream-store/dream-backend/uploads/images/";
    @GetMapping("/image/{filename}")
    public ResponseEntity<Resource> getImage(@PathVariable String filename) {
        try {
            Path filePath = Paths.get(UPLOAD_DIR).resolve(filename).normalize();
            File file = filePath.toFile();

            // Kiểm tra file có tồn tại không
            if (!file.exists() || !file.canRead()) {
                return ResponseEntity.status(HttpStatus.NOT_FOUND).build();
            }
            Resource resource = new UrlResource(file.toURI());

            // Lấy loại file tự động
            String contentType = Files.probeContentType(filePath);
            MediaType mediaType = (contentType != null) ? MediaType.parseMediaType(contentType) : MediaType.APPLICATION_OCTET_STREAM;

            return ResponseEntity.ok()
                    .contentType(mediaType)
                    .header(HttpHeaders.CONTENT_DISPOSITION, "inline; filename=\"" + resource.getFilename() + "\"")
                    .body(resource);
        } catch (MalformedURLException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(null);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(null);
        }
    }
    @GetMapping("/trang-thai/{trangThai}")
    public ResponseEntity<Page<NhanVien>> getNhanVienByTrangThai(
            @PathVariable Integer trangThai,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "8") int size,
            @RequestParam(required = false) Integer idNhanVien) { // Thêm idNhanVien vào tham số

        Page<NhanVien> pagedNhanVien;

        if (trangThai == 2) {
            pagedNhanVien = nhanVienService.getAllNhanVienPaged(page, size,idNhanVien);
        } else {
            pagedNhanVien = nhanVienService.getNhanVienByTrangThai(trangThai, page, size,idNhanVien);
        }

        // Nếu có idNhanVien thì có thể lọc hoặc xử lý tùy vào yêu cầu
        if (idNhanVien != null) {
            // Bạn có thể xử lý dữ liệu với idNhanVien ở đây nếu cần
        }

        return ResponseEntity.ok(pagedNhanVien);
    }


}
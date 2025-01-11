// Controller Class
package com.example.dreambackend.controllers;

import com.example.dreambackend.entities.NhanVien;
import com.example.dreambackend.services.NhanVien.INhanVienService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/nhanvien")
public class NhanVienController {

    @Autowired
    private INhanVienService nhanVienService;

    @GetMapping
    public ResponseEntity<List<NhanVien>> getAllNhanVien() {
        return ResponseEntity.ok(nhanVienService.getAllNhanVien());
    }

    @GetMapping("/{id}")
    public ResponseEntity<NhanVien> getNhanVienById(@PathVariable int id) {
        return nhanVienService.getNhanVienById(id)
                .map(ResponseEntity::ok)
                .orElseThrow(() -> new RuntimeException("NhanVien not found with id: " + id));
    }

    @PostMapping
    public ResponseEntity<NhanVien> createNhanVien(@RequestBody NhanVien nhanVien) {
        return ResponseEntity.ok(nhanVienService.createNhanVien(nhanVien));
    }

    @PutMapping("/{id}")
    public ResponseEntity<NhanVien> updateNhanVien(@PathVariable int id, @RequestBody NhanVien updatedNhanVien) {
        return ResponseEntity.ok(nhanVienService.updateNhanVien(id, updatedNhanVien));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteNhanVien(@PathVariable int id) {
        nhanVienService.deleteNhanVien(id);
        return ResponseEntity.noContent().build();
    }
}

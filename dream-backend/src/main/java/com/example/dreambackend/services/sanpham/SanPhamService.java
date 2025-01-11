package com.example.dreambackend.services.sanpham;

import com.example.dreambackend.entities.SanPham;
import com.example.dreambackend.repositories.SanPhamRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
@Service
public class SanPhamService implements ISanPhamService {
    @Autowired
    SanPhamRepository sanPhamRepository;
    @Override
    public List<SanPham> getAllSanPham() {
        return sanPhamRepository.findAll();
    }
}

package com.example.dreambackend.services.sanphamchitiet;

import com.example.dreambackend.entities.SanPhamChiTiet;
import com.example.dreambackend.repository.SanPhamChiTietRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;


@Service
public class SanPhamChiTietService implements ISanPhamChiTietService {

    @Autowired
    private SanPhamChiTietRepository sanPhamChiTietRepository;


    @Override
    public List<SanPhamChiTiet> getAllSanPhamChiTiet() {
        return sanPhamChiTietRepository.findAll();
    }
}

package com.example.dreambackend.services.khuyenmai;

import com.example.dreambackend.entities.KhuyenMai;
import com.example.dreambackend.entities.Voucher;
import com.example.dreambackend.repositories.KhuyenMaiRepository;
import com.example.dreambackend.repositories.VoucherRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
@Service
public class KhuyenMaiService implements IKhuyenMaiService{
    @Autowired
    KhuyenMaiRepository khuyenMaiRepository;
    @Override
    public List<KhuyenMai> getAllKhuyenMai() {
        return khuyenMaiRepository.findAll();
    }

    @Override
    public KhuyenMai addKhuyenMai(KhuyenMai khuyenMai) {
        return khuyenMaiRepository.save(khuyenMai);
    }
    @Override
    public KhuyenMai updateKhuyenMai(KhuyenMai khuyenMai) {
        return khuyenMaiRepository.save(khuyenMai);
    }
    @Override
    public KhuyenMai getKhuyenMaiById(Integer id) {
        return khuyenMaiRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Khuyến mãi không tồn tại với id: " + id));
    }
}

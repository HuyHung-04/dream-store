package com.example.dreambackend.services.khuyenmai;

import com.example.dreambackend.entities.KhuyenMai;
import com.example.dreambackend.entities.Voucher;

import java.util.List;

public interface IKhuyenMaiService {
    List<KhuyenMai> getAllKhuyenMai();
    KhuyenMai addKhuyenMai(KhuyenMai khuyenMai);
    KhuyenMai updateKhuyenMai(KhuyenMai khuyenMai);
    KhuyenMai getKhuyenMaiById(Integer id);
}

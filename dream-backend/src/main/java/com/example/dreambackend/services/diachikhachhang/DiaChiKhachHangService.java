package com.example.dreambackend.services.diachikhachhang;

import com.example.dreambackend.entities.DiaChiKhachHang;
import com.example.dreambackend.entities.KhachHang;
import com.example.dreambackend.repositories.DiaChiKhachHangRepository;
import com.example.dreambackend.repositories.KhachHangRepository;
import com.example.dreambackend.requests.DiaChiKhachHangRequest;
import com.example.dreambackend.responses.DiaChiKhachHangRespone;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.util.List;
@Service
public class DiaChiKhachHangService implements IDiaChiKhachHangService{
    @Autowired
    DiaChiKhachHangRepository diaChiKhachHangRepository;

    @Autowired
    KhachHangRepository khachHangRepository;

    @Override
    public List<DiaChiKhachHangRespone> getDiaChiKhachHang(Integer idKhachHang) {
        return diaChiKhachHangRepository.getAllDiaChiKhachHang(idKhachHang);
    }

    @Override
    public DiaChiKhachHang addDiaChi(DiaChiKhachHangRequest request) {
        DiaChiKhachHang diaChi = new DiaChiKhachHang();
        diaChi.setThon(request.getThon());
        diaChi.setPhuongXa(request.getPhuongXa());
        diaChi.setQuanHuyen(request.getQuanHuyen());
        diaChi.setTinhThanhPho(request.getTinhThanhPho());
        diaChi.setMoTa(request.getMoTa());
        diaChi.setNgayTao(LocalDate.now());
        diaChi.setTrangThai(request.getTrangThai());

        return diaChiKhachHangRepository.save(diaChi);
    }

    @Override
    public DiaChiKhachHang updateDiaChi(Integer id, DiaChiKhachHangRequest request) {
        DiaChiKhachHang diaChi = diaChiKhachHangRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy địa chỉ khách hàng"));

        // Cập nhật thông tin địa chỉ
        diaChi.setThon(request.getThon());
        diaChi.setPhuongXa(request.getPhuongXa());
        diaChi.setQuanHuyen(request.getQuanHuyen());
        diaChi.setTinhThanhPho(request.getTinhThanhPho());
        diaChi.setMoTa(request.getMoTa());
        diaChi.setNgaySua(LocalDate.now());
        diaChi.setTrangThai(request.getTrangThai());

        KhachHang khachHang = diaChi.getKhachHang();
        if (khachHang != null) {
            khachHang.setTen(request.getTenKhachHang());
            khachHang.setSoDienThoai(request.getSoDienThoai());
            khachHangRepository.save(khachHang);
        }

        return diaChiKhachHangRepository.save(diaChi);
    }
}

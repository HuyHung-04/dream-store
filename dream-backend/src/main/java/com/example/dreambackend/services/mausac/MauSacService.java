package com.example.dreambackend.services.mausac;

import com.example.dreambackend.entities.MauSac;
import com.example.dreambackend.entities.XuatXu;
import com.example.dreambackend.repositories.MauSacRepository;
import com.example.dreambackend.requests.MauSacRequest;
import com.example.dreambackend.requests.XuatXuRequest;
import com.example.dreambackend.responses.MauSacRepone;
import org.springframework.beans.BeanUtils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.util.List;
import java.util.Random;

@Service
public class MauSacService implements IMauSacService{
    @Autowired
    MauSacRepository mauSacRepository;
    @Override
    public List<MauSacRepone> getAllMauSac() {
        return mauSacRepository.getAllMauSacRepone();
    }

    @Override
    public MauSac getMauSacById(Integer id) {
        return mauSacRepository.findById(id).orElseThrow(()->
                new RuntimeException("Không tìm thấy id màu sắc"));
    }

    @Override
    public MauSac addMauSac(MauSacRequest mauSacRequest) {
        MauSac mauSac = new MauSac();
        BeanUtils.copyProperties(mauSacRequest, mauSac);
        mauSac.setMa(taoMaMauSac());
        mauSac.setNgayTao(LocalDate.now());
        mauSac.setNgaySua(LocalDate.now());
        return mauSacRepository.save(mauSac);
    }

    public boolean existsMau(String ten) {
        return mauSacRepository.existsByTen(ten);
    }

    private String taoMaMauSac() {
        Random random = new Random();
        String maMauSac;
        do {
            int soNgauNhien = 1 + random.nextInt(9999); // Sinh số từ 1 đến 9999
            String maSo = String.format("%04d", soNgauNhien); // Định dạng thành 4 chữ số
            maMauSac = "MS" + maSo;
        } while (mauSacRepository.existsByMa(maMauSac)); // Kiểm tra xem mã đã tồn tại chưa
        return maMauSac;
    }

    @Override
    public MauSac updateTrangThaiMauSac(MauSacRequest request) {
        MauSac mauSac = mauSacRepository.findById(request.getId())
                .orElseThrow(() -> new RuntimeException("Không tìm thấy size với id: " + request.getId()));
        mauSac.setTrangThai(request.getTrangThai());
        mauSac.setNgaySua(LocalDate.now());
        return mauSacRepository.save(mauSac);
    }
}

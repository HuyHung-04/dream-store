package com.example.dreambackend.services.thuonghieu;


import com.example.dreambackend.entities.ThuongHieu;
import com.example.dreambackend.entities.XuatXu;
import com.example.dreambackend.repositories.ThuongHieuRepository;
import com.example.dreambackend.requests.ThuongHieuRequest;
import com.example.dreambackend.requests.XuatXuRequest;
import com.example.dreambackend.responses.ThuongHieuRespone;
import org.springframework.beans.BeanUtils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.util.List;
import java.util.Random;

@Service
public class ThuongHieuService implements IThuongHieuService{
    @Autowired
    ThuongHieuRepository thuongHieuRepository;

    @Override
    public List<ThuongHieuRespone> getAllThuongHieu() {
        return thuongHieuRepository.getAllThuongHieuRespones();
    }

    @Override
    public ThuongHieu getThuongHieu(Integer id) {
        return thuongHieuRepository.findById(id).orElseThrow(()->
                new RuntimeException("Không tìm thấy id thương hiệu"));
    }

    @Override
    public ThuongHieu addThuongHieu(ThuongHieuRequest thuongHieuRequest) {
        ThuongHieu thuongHieu = new ThuongHieu();
        BeanUtils.copyProperties(thuongHieuRequest, thuongHieu);
        thuongHieu.setMa(taoMaThuongHieu());
        thuongHieu.setNgayTao(LocalDate.now());
        thuongHieu.setNgaySua(LocalDate.now());
        return thuongHieuRepository.save(thuongHieu);
    }

    public boolean existsThuongHieu(String ten) {
        return thuongHieuRepository.existsByTen(ten);
    }

    private String taoMaThuongHieu() {
        Random random = new Random();
        String maThuongHieu;
        do {
            int soNgauNhien = 1 + random.nextInt(9999); // Sinh số từ 1 đến 9999
            String maSo = String.format("%04d", soNgauNhien); // Định dạng thành 4 chữ số
            maThuongHieu = "TH" + maSo;
        } while (thuongHieuRepository.existsByMa(maThuongHieu)); // Kiểm tra xem mã đã tồn tại chưa
        return maThuongHieu;
    }

    @Override
    public ThuongHieu updateTrangThaiThuongHieu(ThuongHieuRequest request) {
        ThuongHieu thuongHieu = thuongHieuRepository.findById(request.getId())
                .orElseThrow(() -> new RuntimeException("Không tìm thấy size với id: " + request.getId()));
        thuongHieu.setTrangThai(request.getTrangThai());
        thuongHieu.setNgaySua(LocalDate.now());
        return thuongHieuRepository.save(thuongHieu);
    }
}

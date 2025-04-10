package com.example.dreambackend.services.xuatxu;


import com.example.dreambackend.entities.Size;
import com.example.dreambackend.entities.XuatXu;
import com.example.dreambackend.repositories.XuatXuRepository;
import com.example.dreambackend.requests.SizeRequest;
import com.example.dreambackend.requests.XuatXuRequest;
import com.example.dreambackend.responses.XuatXuRespone;
import org.springframework.beans.BeanUtils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.util.List;
import java.util.Random;

@Service
public class XuatXuService implements IXuatXuService {
    @Autowired
    XuatXuRepository xuatXuRepository;

    @Override
    public List<XuatXuRespone> getAllXuatXu() {
        return xuatXuRepository.getAllXuatXuRespone();
    }

    @Override
    public XuatXu getXuatXu(Integer id) {
        return xuatXuRepository.findById(id).orElseThrow(()->
                new RuntimeException("Không tìm thấy id xuất xứ"));
    }

    @Override
    public XuatXu addXuatXu(XuatXuRequest xuatXuRequest) {
        XuatXu xuatXu = new XuatXu();
        BeanUtils.copyProperties(xuatXuRequest, xuatXu);
        xuatXu.setMa(taoMaXuatXu());
        xuatXu.setNgayTao(LocalDate.now());
        xuatXu.setNgaySua(LocalDate.now());
        return xuatXuRepository.save(xuatXu);
    }

    public boolean existsXuatXu(String ten) {
        return xuatXuRepository.existsByTen(ten);
    }

    private String taoMaXuatXu() {
        Random random = new Random();
        String maXuatXu;
        do {
            int soNgauNhien = 1 + random.nextInt(9999); // Sinh số từ 1 đến 9999
            String maSo = String.format("%04d", soNgauNhien); // Định dạng thành 4 chữ số
            maXuatXu = "XX" + maSo;
        } while (xuatXuRepository.existsByMa(maXuatXu)); // Kiểm tra xem mã đã tồn tại chưa
        return maXuatXu;
    }

    @Override
    public XuatXu updateTrangThaiXuatXu(XuatXuRequest request) {
        XuatXu xuatXu = xuatXuRepository.findById(request.getId())
                .orElseThrow(() -> new RuntimeException("Không tìm thấy size với id: " + request.getId()));
        xuatXu.setTrangThai(request.getTrangThai());
        xuatXu.setNgaySua(LocalDate.now());
        return xuatXuRepository.save(xuatXu);
    }
}

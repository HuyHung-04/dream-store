package com.example.dreambackend.services.size;

import com.example.dreambackend.entities.Size;
import com.example.dreambackend.repositories.SizeRepository;
import com.example.dreambackend.requests.SizeRequest;
import com.example.dreambackend.responses.SizeRespone;
import org.springframework.beans.BeanUtils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.util.List;
import java.util.Random;

@Service
public class SizeService implements ISizeService {
    @Autowired
    SizeRepository sizeRepository;
    @Override
    public List<SizeRespone> getAllSize() {
        return sizeRepository.getAllSizeRespones();
    }

    @Override
    public Size addSize(SizeRequest sizeRequest) {
        Size size = new Size();
        BeanUtils.copyProperties(sizeRequest, size);
        size.setMa(taoMaSize());
        size.setNgayTao(LocalDate.now());
        size.setNgaySua(LocalDate.now());
        return sizeRepository.save(size);
    }

    public boolean existsSize(String ten) {
        return sizeRepository.existsByTen(ten);
    }

    private String taoMaSize() {
        Random random = new Random();
        String maSize;
        do {
            int soNgauNhien = 1 + random.nextInt(9999); // Sinh số từ 1 đến 9999
            String maSo = String.format("%04d", soNgauNhien); // Định dạng thành 4 chữ số
            maSize = "S" + maSo;
        } while (sizeRepository.existsByMa(maSize)); // Kiểm tra xem mã đã tồn tại chưa
        return maSize;
    }

    @Override
    public Size updateTrangThaiSize(SizeRequest request) {
        Size size = sizeRepository.findById(request.getId())
                .orElseThrow(() -> new RuntimeException("Không tìm thấy size với id: " + request.getId()));

        size.setTrangThai(request.getTrangThai());
        size.setNgaySua(LocalDate.now());

        return sizeRepository.save(size);
    }


    @Override
    public Size getSize(Integer id) {
        return sizeRepository.findById(id).orElseThrow(()->
                new RuntimeException("Không tìm thấy id size"));
    }
}

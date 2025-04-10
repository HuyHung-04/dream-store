package com.example.dreambackend.services.coao;

import com.example.dreambackend.entities.ChatLieu;
import com.example.dreambackend.entities.CoAo;
import com.example.dreambackend.repositories.CoAoRepository;
import com.example.dreambackend.requests.ChatLieuRequest;
import com.example.dreambackend.requests.CoAoRequest;
import com.example.dreambackend.responses.CoAoRespone;
import org.springframework.beans.BeanUtils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.util.List;
import java.util.Random;

@Service
public class CoAoService implements ICoAoService {
    @Autowired
    CoAoRepository coAoRepository;

    @Override
    public List<CoAoRespone> getAllCoAo() {
        return coAoRepository.getAllCoAoRespones();
    }

    @Override
    public CoAo getCoAoById(Integer id) {
        return coAoRepository.findById(id).orElseThrow(()->
                new RuntimeException("Không tìm thấy id cổ áo"));
    }

    @Override
    public CoAo addCoAo(CoAoRequest coAoRequest) {
        CoAo coAo = new CoAo();
        BeanUtils.copyProperties(coAoRequest, coAo);
        coAo.setMa(taoMaCoAo());
        coAo.setNgayTao(LocalDate.now());
        coAo.setNgaySua(LocalDate.now());
        return coAoRepository.save(coAo);
    }

    public boolean existsCoAo(String ten) {
        return coAoRepository.existsByTen(ten);
    }

    private String taoMaCoAo() {
        Random random = new Random();
        String maCoAo;
        do {
            int soNgauNhien = 1 + random.nextInt(9999); // Sinh số từ 1 đến 9999
            String maSo = String.format("%04d", soNgauNhien); // Định dạng thành 4 chữ số
            maCoAo = "CA" + maSo;
        } while (coAoRepository.existsByMa(maCoAo)); // Kiểm tra xem mã đã tồn tại chưa
        return maCoAo;
    }

    @Override
    public CoAo updateTrangThaiCoAo(CoAoRequest request) {
        CoAo coAo = coAoRepository.findById(request.getId())
                .orElseThrow(() -> new RuntimeException("Không tìm thấy size với id: " + request.getId()));
        coAo.setTrangThai(request.getTrangThai());
        coAo.setNgaySua(LocalDate.now());
        return coAoRepository.save(coAo);
    }
}

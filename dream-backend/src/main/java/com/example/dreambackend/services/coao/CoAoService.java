package com.example.dreambackend.services.coao;

import com.example.dreambackend.dtos.CoAoDto;
import com.example.dreambackend.entities.CoAo;
import com.example.dreambackend.repositories.CoAoRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class CoAoService implements ICoAoService {
    @Autowired
    CoAoRepository coAoRepository;

    @Override
    public List<CoAo> getAllCoAo() {
        return coAoRepository.findAll();
    }

    @Override
    public CoAo getCoAoById(Integer idCoAo) {
        return coAoRepository.findById(idCoAo).orElseThrow(()->
                new RuntimeException("Không tìm thấy id cổ áo"));
    }

    @Override
    public CoAo addCoAo(CoAoDto coAoDto) {
        CoAo newCoAo = CoAo.builder()
                .ma(coAoDto.getMa())
                .ten(coAoDto.getTen())
                .ngayTao(coAoDto.getNgayTao())
                .ngaySua(coAoDto.getNgaySua())
                .trangThai(coAoDto.getTrangThai())
                .build();
        return coAoRepository.save(newCoAo);
    }

    @Override
    public CoAo updateCoAo(Integer idCoAo, CoAoDto coAoDto) {
        CoAo coAoUpdate = getCoAoById(idCoAo);
        coAoUpdate.setTen(coAoDto.getTen());
        coAoRepository.save(coAoUpdate);
        return coAoUpdate;
    }
}

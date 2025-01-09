package com.example.dreambackend.services.thuonghieu;


import com.example.dreambackend.dtos.ThuongHieuDto;

import com.example.dreambackend.entities.ThuongHieu;
import com.example.dreambackend.repositories.ThuongHieuRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
@Service
public class ThuongHieuService implements IThuongHieuService{
    @Autowired
    ThuongHieuRepository thuongHieuRepository;
    @Override
    public List<ThuongHieu> getAllThuongHieu() {
        return thuongHieuRepository.findAll();
    }


    @Override
    public ThuongHieu getThuongHieu(Integer idThuongHieu) {
       return thuongHieuRepository.findById(idThuongHieu).orElseThrow(()->
                new RuntimeException("Không tìm thấy id thương hiệu"));
    }

    @Override
    public ThuongHieu addThuongHieu(ThuongHieuDto thuongHieuDto) {
        ThuongHieu newThuongHieu = ThuongHieu.builder()
                .ma(thuongHieuDto.getMa())
                .ten(thuongHieuDto.getTen())
                .ngayTao(thuongHieuDto.getNgayTao())
                .ngaySua(thuongHieuDto.getNgaySua())
                .trangThai(thuongHieuDto.getTrangThai())
                .build();
        return thuongHieuRepository.save(newThuongHieu);
    }

    @Override
    public ThuongHieu updateThuongHieu(Integer idThuongHieu, ThuongHieuDto thuongHieuDto) {
        ThuongHieu thuongHieuUpdate = getThuongHieu(idThuongHieu);
        thuongHieuUpdate.setTen(thuongHieuDto.getTen());
        thuongHieuRepository.save(thuongHieuUpdate);
        return thuongHieuUpdate;
    }

}

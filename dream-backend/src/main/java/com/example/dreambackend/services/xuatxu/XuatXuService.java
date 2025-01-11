package com.example.dreambackend.services.xuatxu;


import com.example.dreambackend.dtos.XuatXuDto;

import com.example.dreambackend.entities.XuatXu;
import com.example.dreambackend.repositories.XuatXuRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class XuatXuService implements IXuatXuService {
    @Autowired
    XuatXuRepository xuatXuRepository;
    @Override
    public List<XuatXu> getAllXuatXu() {
        return xuatXuRepository.findAll();
    }


    @Override
    public XuatXu getXuatXu(Integer idXuatXu) {
        return xuatXuRepository.findById(idXuatXu).orElseThrow(()->
                new RuntimeException("Không tìm thấy id xuất xứ"));
    }

    @Override
    public XuatXu addXuatXu(XuatXuDto xuatXuDto) {
        XuatXu newXuatXu = XuatXu.builder()
                .ma(xuatXuDto.getMa())
                .ten(xuatXuDto.getTen())
                .ngayTao(xuatXuDto.getNgayTao())
                .ngaySua(xuatXuDto.getNgaySua())
                .trangThai(xuatXuDto.getTrangThai())
                .build();
        return xuatXuRepository.save(newXuatXu);
    }

    @Override
    public XuatXu updateXuatXu(Integer idXuatXu, XuatXuDto xuatXuDto) {
        XuatXu xuatXuUpdate = getXuatXu(idXuatXu);
        xuatXuUpdate.setTen(xuatXuDto.getTen());
        xuatXuRepository.save(xuatXuUpdate);
        return xuatXuUpdate;
    }

}

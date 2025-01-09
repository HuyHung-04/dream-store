package com.example.dreambackend.services.thuonghieu;


import com.example.dreambackend.dtos.ThuongHieuDto;

import com.example.dreambackend.entities.ThuongHieu;

import java.util.List;

public interface IThuongHieuService {
    List<ThuongHieu> getAllThuongHieu();


    ThuongHieu getThuongHieu(Integer idThuongHieu);

    ThuongHieu addThuongHieu(ThuongHieuDto thuongHieuDto);

    ThuongHieu updateThuongHieu(Integer idThuongHieu, ThuongHieuDto thuongHieuDto);

}

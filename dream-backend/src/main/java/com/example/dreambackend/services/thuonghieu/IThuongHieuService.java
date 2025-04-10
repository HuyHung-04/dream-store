package com.example.dreambackend.services.thuonghieu;


import com.example.dreambackend.entities.ThuongHieu;
import com.example.dreambackend.requests.ThuongHieuRequest;
import com.example.dreambackend.responses.ThuongHieuRespone;

import java.util.List;

public interface IThuongHieuService {
    List<ThuongHieuRespone> getAllThuongHieu();


    ThuongHieu getThuongHieu(Integer id);

    ThuongHieu addThuongHieu(ThuongHieuRequest thuongHieuRequest);

    ThuongHieu updateTrangThaiThuongHieu(ThuongHieuRequest request);

}

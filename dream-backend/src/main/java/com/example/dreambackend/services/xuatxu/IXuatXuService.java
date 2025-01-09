package com.example.dreambackend.services.xuatxu;


import com.example.dreambackend.dtos.XuatXuDto;

import com.example.dreambackend.entities.XuatXu;

import java.util.List;

public interface IXuatXuService {
    List<XuatXu> getAllXuatXu();


    XuatXu getXuatXu(Integer idXuatXu);

    XuatXu addXuatXu(XuatXuDto xuatXuDto);

    XuatXu updateXuatXu(Integer idXuatXu, XuatXuDto xuatXuDto);

}

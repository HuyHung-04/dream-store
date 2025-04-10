package com.example.dreambackend.services.xuatxu;


import com.example.dreambackend.entities.XuatXu;
import com.example.dreambackend.requests.XuatXuRequest;
import com.example.dreambackend.responses.XuatXuRespone;

import java.util.List;

public interface IXuatXuService {
    List<XuatXuRespone> getAllXuatXu();

    XuatXu getXuatXu(Integer id);

    XuatXu addXuatXu(XuatXuRequest xuatXuRequest);

    XuatXu updateTrangThaiXuatXu(XuatXuRequest request);

}

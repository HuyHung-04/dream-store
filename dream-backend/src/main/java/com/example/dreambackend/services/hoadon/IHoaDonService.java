package com.example.dreambackend.services.hoadon;

import com.example.dreambackend.dtos.DataTableResults;
import com.example.dreambackend.entities.HoaDon;
import com.example.dreambackend.requests.HoaDonRequest;
import com.example.dreambackend.requests.HoaDonSearchRequest;
import com.example.dreambackend.responses.HoaDonResponse;
import org.springframework.data.domain.Page;

import java.util.List;

public interface IHoaDonService {
    HoaDonResponse updateHoaDon(Integer id, HoaDonRequest request);
    HoaDonResponse createHoaDon(HoaDonRequest request);
    HoaDonResponse findById(Integer id);
    DataTableResults<HoaDonResponse> getAllHoaDon(HoaDonSearchRequest request,Integer idNhanVien);
    void cancelHoaDon(Integer id, String ghiChu);
    Page<HoaDon> getHoaDonsByTrangThaiAndNguoiNhanAndMa(Integer trangThai, String tenNguoiNhan, String sdtNguoiNhan, String maHoaDon,int page,int size);
    public String cancelHoaDonsByNhanVienId(Integer idNhanVien);
    public String assignHoaDonToNewNhanVien(Integer idNhanVienCu, Integer idNhanVienMoi);
}
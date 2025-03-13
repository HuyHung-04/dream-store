package com.example.dreambackend.services.diachikhachhang;

import com.example.dreambackend.entities.DiaChiKhachHang;
import com.example.dreambackend.entities.KhachHang;
import com.example.dreambackend.entities.KhuyenMai;
import com.example.dreambackend.repositories.DiaChiKhachHangRepository;
import com.example.dreambackend.repositories.KhachHangRepository;
import com.example.dreambackend.requests.DiaChiKhachHangRequest;
import com.example.dreambackend.responses.DiaChiKhachHangRespone;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.util.List;
@Service
public class DiaChiKhachHangService implements IDiaChiKhachHangService{
    @Autowired
    DiaChiKhachHangRepository diaChiKhachHangRepository;

    @Autowired
    KhachHangRepository khachHangRepository;

    @Override
    public List<DiaChiKhachHang> getDiaChiKhachHang(Integer idKhachHang) {
        return diaChiKhachHangRepository.getAllDiaChiKhachHang(idKhachHang);
    }

    @Override
    public DiaChiKhachHang addDiaChi(DiaChiKhachHang diaChiKhachHang) {

        return diaChiKhachHangRepository.save(diaChiKhachHang);
    }

    @Override
    public DiaChiKhachHang updateDiaChi( DiaChiKhachHang diaChi) {
        return diaChiKhachHangRepository.save(diaChi);
    }


@Override
    public Integer getIdBySdtNguoiNhan(String sdtNguoiNhan) {
        return diaChiKhachHangRepository.findIdBySdtNguoiNhan(sdtNguoiNhan);
    }

    @Override
    public DiaChiKhachHang getDiaChiById(Integer id) {
        return diaChiKhachHangRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Khuyến mãi không tồn tại với id: " + id));
    }

    @Override
    public void deleteDiaChi(Integer id) {
        if (!diaChiKhachHangRepository.existsById(id)) {
            throw new IllegalArgumentException("Địa chỉ không tồn tại với id: " + id);
        }
        diaChiKhachHangRepository.deleteById(id);
    }
}

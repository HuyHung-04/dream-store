package com.example.dreambackend.services.hoadon;

import com.example.dreambackend.dtos.GioHangDTO;
import com.example.dreambackend.dtos.HoaDonDTO;
import com.example.dreambackend.entities.*;
import com.example.dreambackend.repository.HoaDonChiTietRepository;
import com.example.dreambackend.repository.HoaDonRepository;
import com.example.dreambackend.repository.KhachHangRepository;
import com.example.dreambackend.repository.NhanVienRepository;
import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.RequiredArgsConstructor;
import org.modelmapper.ModelMapper;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;


@Service
@RequiredArgsConstructor
public class HoaDonService implements IHoaDonService {

    private final HoaDonRepository hoaDonRepository;
    private final ModelMapper modelMapper;
    private final KhachHangRepository khachHangRepository;
    private final NhanVienRepository  nhanVienRepository;
    private final HoaDonChiTietRepository hoaDonChiTietRepository;

    @Override
    public HoaDon getHoaDonById(int id) {
        return hoaDonRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("HoaDon not found"));
    }

    @Override
    public HoaDon createHoaDon(HoaDonDTO hoaDonDTO) throws Exception{
        // Kiem tra co khach hang hay khong
        KhachHang khachHang = khachHangRepository.findById(hoaDonDTO.getIdKhachHang())
                .orElseThrow(() -> new RuntimeException("KhachHang not found"));
        NhanVien nhanVien = nhanVienRepository.findById(hoaDonDTO.getIdNhanVien())
                .orElseThrow(() -> new RuntimeException("NhanVien not found"));

        modelMapper.typeMap(HoaDonDTO.class, HoaDon.class)
                .addMappings(mapper -> {
                    mapper.skip(HoaDon::setId);
                    mapper.map(HoaDonDTO::getIdKhachHang, (hoaDon, idKhachHang) -> hoaDon.getKhachHang().setId(idKhachHang));
                    mapper.map(HoaDonDTO::getIdNhanVien, (hoaDon, idNhanVien) -> hoaDon.getNhanVien().setId(idNhanVien));
                });

        // Tao hoa don moi
        HoaDon hoaDon = modelMapper.map(hoaDonDTO, HoaDon.class);
        hoaDon.setId(null); // Đảm bảo ID là null để được tự động sinh
        hoaDon.setKhachHang(khachHang);
        hoaDon.setNhanVien(nhanVien);
        hoaDon.setNgayTao(LocalDate.now());
        hoaDon.setTrangThai(TrangThaiHoaDon.PENDING);
        // add list hdct vao hoa don
        List<HoaDonChiTiet> listHDCT = new ArrayList<>();
        for (GioHangDTO gioHangDTO : hoaDonDTO.getGioHang()) {
            HoaDonChiTiet hoaDonChiTiet = new HoaDonChiTiet();
            hoaDonChiTiet.setHoaDon(hoaDon);
            hoaDonChiTiet.setSoLuong(gioHangDTO.getSoLuong());
            hoaDonChiTiet.setDonGia((float) gioHangDTO.getGiaSauGiam());
            hoaDonChiTiet.setNgayTao(gioHangDTO.getNgayTao());
            hoaDonChiTiet.setNgaySua(gioHangDTO.getNgaySua());
            listHDCT.add(hoaDonChiTiet);
        }

        hoaDonChiTietRepository.saveAll(listHDCT);
        hoaDonRepository.save(hoaDon);
        return hoaDon;
    }

    @Override
    public List<HoaDon> getListHoaDon() {
        return hoaDonRepository.findAll();
    }

    @Override
    public HoaDon updateHoaDon(HoaDonDTO hoaDonDTO) {
        return null;
    }

    @Override
    public List<HoaDon> findHoaDonByKhachHangId(int id) {
        return hoaDonRepository.findHoaDonByKhachHang_Id(id);
    }

    @Override
    public void deleteHoaDon(int id) {
    }

}

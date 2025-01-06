package com.example.dreambackend.services.hoadon;

import com.example.dreambackend.dtos.GioHangDTO;
import com.example.dreambackend.dtos.HoaDonDTO;
import com.example.dreambackend.entities.*;
import com.example.dreambackend.repository.*;
import lombok.RequiredArgsConstructor;
import org.modelmapper.ModelMapper;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
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
    private final GioHangRepository gioHangRepository;

    @Override
    public HoaDon getHoaDonById(int id) {
        return hoaDonRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("HoaDon not found"));
    }

    @Override
    public HoaDon createHoaDon(HoaDonDTO hoaDonDTO) throws Exception {
        // Validate KhachHang and NhanVien existence
        KhachHang khachHang = khachHangRepository.findById(hoaDonDTO.getIdKhachHang())
                .orElseThrow(() -> new RuntimeException("KhachHang not found"));

        NhanVien nhanVien = nhanVienRepository.findById(hoaDonDTO.getIdNhanVien())
                .orElseThrow(() -> new RuntimeException("NhanVien not found"));

//
//        GioHang gioHang = gioHangRepository.findById(hoaDonDTO.)
        // Map HoaDonDTO to HoaDon
        HoaDon hoaDon = new HoaDon();
        hoaDon.setMa(hoaDonDTO.getMa());
        hoaDon.setTenNguoiNhan(hoaDonDTO.getTenNguoiNhan());
        hoaDon.setDiaChiNhanHang(hoaDonDTO.getDiaChiNhanHang());
        hoaDon.setSdtNhanHang(hoaDonDTO.getSdtNhanHang());
        hoaDon.setTongTien(hoaDonDTO.getTongTien());
        hoaDon.setTongTienSauGiam(hoaDonDTO.getTongTienSauGiam());
        hoaDon.setHinhThucThanhToan(hoaDonDTO.getHinhThucThanhToan());
        hoaDon.setPhiVanChuyen(hoaDonDTO.getPhiVanChuyen());
        hoaDon.setNgayTao(LocalDate.now());
        hoaDon.setTrangThai(hoaDonDTO.getTrangThai());
        hoaDon.setKhachHang(khachHang);
        hoaDon.setNhanVien(nhanVien);

        HoaDon savedHoaDon = hoaDonRepository.save(hoaDon);

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

        return savedHoaDon;
    }

    @Override
    public org.springframework.data.domain.Page<HoaDon> getListHoaDon(Pageable pageable) {
        return hoaDonRepository.findAll(pageable);
    }


    @Override
    public HoaDon updateHoaDon(int id, HoaDonDTO hoaDonDTO) {
        HoaDon hoaDon = hoaDonRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("HoaDon not found"));

        KhachHang khachHang = khachHangRepository.findById(hoaDonDTO.getIdKhachHang())
                .orElseThrow(() -> new RuntimeException("KhachHang not found"));

        if(hoaDonDTO.getIdKhachHang()!=0){
            KhachHang khachHang1 = new KhachHang();
            khachHang1.setMa(hoaDonDTO.getMa());
            hoaDon.setKhachHang(khachHang1);
        }
        if(hoaDonDTO.getTenNguoiNhan()!=null && !hoaDonDTO.getTenNguoiNhan().isEmpty()){
            hoaDon.setTenNguoiNhan(hoaDonDTO.getTenNguoiNhan().trim());
        }
        if(hoaDonDTO.getDiaChiNhanHang()!=null&&!hoaDonDTO.getDiaChiNhanHang().isEmpty()){
            hoaDon.setDiaChiNhanHang(hoaDonDTO.getDiaChiNhanHang().trim());
        }

        if(hoaDonDTO.getTongTien()!=null){
            hoaDon.setTongTien(hoaDonDTO.getTongTien());
        }
        if(hoaDonDTO.getTongTienSauGiam()!=null){
            hoaDon.setTongTienSauGiam(hoaDonDTO.getTongTienSauGiam());
        }
        if(hoaDonDTO.getTrangThai()!=null){
            hoaDon.setTrangThai(hoaDonDTO.getTrangThai());
        }

        if (hoaDonDTO.getMa()!=null && hoaDonDTO.getMa().trim().isEmpty()) {
            hoaDon.setMa(hoaDonDTO.getMa().trim());
        }

        if(hoaDonDTO.getHinhThucThanhToan() != 0){
            hoaDon.setHinhThucThanhToan(hoaDonDTO.getHinhThucThanhToan());
        }

        hoaDon.setKhachHang(khachHang);
        return hoaDonRepository.save(hoaDon);
    }

    @Override
    public List<HoaDon> findHoaDonByKhachHangId(int id) {
        return hoaDonRepository.findHoaDonByKhachHang_Id(id);
    }

    @Override
    public void deleteHoaDon(int id) {
    }

    @Override
    public List<HoaDon> findFilteredHoaDon(String search1, String search2, String combo1, String combo2, String fromDate, String toDate) {
        LocalDate from = (fromDate != null && !fromDate.isEmpty() )? LocalDate.parse(fromDate) : null;
        LocalDate to = (toDate != null && !toDate.isEmpty() )? LocalDate.parse(toDate) : null;

        if(from!=null && to!=null){
            return hoaDonRepository.findFilteredData(search1,search2,combo1,combo2,from,to);
        }
        else if(from == null && to == null){
            return hoaDonRepository.findFilteredData(search1,search2,combo1,combo2,null,null);
        }else if(to == null){
            return hoaDonRepository.findFilteredData(search1,search2,combo1,combo2,from,null);
        }
        else {
            return hoaDonRepository.findFilteredData(search1,search2,combo1,combo2,null,to);
        }
    }

}

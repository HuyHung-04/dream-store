package com.example.dreambackend.services.hoadonchitiet;

import com.example.dreambackend.dtos.HoaDonChiTietDTO;
import com.example.dreambackend.entities.HoaDon;
import com.example.dreambackend.entities.HoaDonChiTiet;
import com.example.dreambackend.entities.SanPhamChiTiet;
import com.example.dreambackend.repository.HoaDonChiTietRepository;
import com.example.dreambackend.repository.HoaDonRepository;
import com.example.dreambackend.repository.SanPhamChiTietRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.util.List;

@Service
@RequiredArgsConstructor
public class HoaDonChiTietService implements IHoaDonChiTietService{

    private final HoaDonChiTietRepository hoaDonChiTietRepository;
    private final HoaDonRepository hoaDonRepository;
    private final SanPhamChiTietRepository sanPhamChiTietRepository;

    @Override
    public List<HoaDonChiTiet> getAllHoaDonChiTiet() {
        return hoaDonChiTietRepository.findAll();
    }

    @Override
    public HoaDonChiTiet getHoaDonChiTietById(int id) {
        return hoaDonChiTietRepository.findById(id).get();
    }

    @Override
    public HoaDonChiTiet createHoaDonChiTiet(HoaDonChiTietDTO hoaDonChiTietDTO) {
        HoaDon hoaDon = hoaDonRepository.findById(hoaDonChiTietDTO.getIdHoaDon())
                .orElseThrow(() -> new RuntimeException("HoaDon not found"));

        SanPhamChiTiet sanPhamChiTiet = sanPhamChiTietRepository.findById(hoaDonChiTietDTO.getIdSanPhamChiTiet())
                .orElseThrow(() -> new RuntimeException("SanPhamChiTiet not found"));

        HoaDonChiTiet hoaDonChiTiet = HoaDonChiTiet.builder()
                .soLuong(hoaDonChiTietDTO.getSoLuong())
                .donGia(hoaDonChiTietDTO.getDonGia())
                .ngaySua(hoaDonChiTietDTO.getNgaySua())
                .ngayTao(LocalDate.now())
                .trangThai(hoaDonChiTietDTO.getTrangThai())
                .hoaDon(hoaDon)
                .sanPhamChiTiet(sanPhamChiTiet)
                .build();
        return hoaDonChiTietRepository.save(hoaDonChiTiet);
    }

    @Override
    public HoaDonChiTiet updateHoaDonChiTiet(int id, HoaDonChiTietDTO newHoaDonChiTietDTO) {

        HoaDonChiTiet hoaDonChiTiet = hoaDonChiTietRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("HoaDonChiTiet not found"));
        HoaDon hoaDon = hoaDonRepository.findById(newHoaDonChiTietDTO.getIdHoaDon())
                .orElseThrow(() -> new RuntimeException("HoaDon not found"));
        SanPhamChiTiet sanPhamChiTiet =sanPhamChiTietRepository.findById(newHoaDonChiTietDTO.getIdHoaDon())
                .orElseThrow(() -> new RuntimeException("SanPhamChiTiet not found"));

        hoaDonChiTiet.setSoLuong(newHoaDonChiTietDTO.getSoLuong());
        hoaDonChiTiet.setDonGia(newHoaDonChiTietDTO.getDonGia());
        hoaDonChiTiet.setNgayTao(newHoaDonChiTietDTO.getNgayTao());
        hoaDonChiTiet.setNgaySua(LocalDate.now());
        hoaDonChiTiet.setTrangThai(newHoaDonChiTietDTO.getTrangThai());

        return hoaDonChiTietRepository.save(hoaDonChiTiet);
    }

    @Override
    public List<HoaDonChiTiet> getHoaDonChiTietByHoaDonId(int id) {
        return hoaDonChiTietRepository.findByHoaDonId(id);
    }
}

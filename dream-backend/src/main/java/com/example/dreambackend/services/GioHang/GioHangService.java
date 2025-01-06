
package com.example.dreambackend.services.GioHang;

import com.example.dreambackend.dtos.GioHangDTO;
import com.example.dreambackend.entities.GioHang;
import com.example.dreambackend.entities.KhachHang;
import com.example.dreambackend.entities.SanPhamChiTiet;
import com.example.dreambackend.repository.GioHangRepository;
import com.example.dreambackend.repository.KhachHangRepository;
import com.example.dreambackend.repository.SanPhamChiTietRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.util.List;

@Service
@RequiredArgsConstructor
public class GioHangService implements IGioHangService{

    private final GioHangRepository gioHangRepository;
    private final KhachHangRepository khachHangRepository;
    private final SanPhamChiTietRepository sanPhamChiTietRepository;

    @Override
    public GioHang createGioHang(GioHangDTO gioHangDTO) {
        List<GioHang> lstGioHang = gioHangRepository.findGioHangsByKhachHang_Id(gioHangDTO.getIdKhachHang());

        KhachHang khachHang = khachHangRepository.findById(gioHangDTO.getIdKhachHang())
                .orElseThrow(() -> new RuntimeException("KhachHang not found"));

        SanPhamChiTiet sanPhamChiTiet = sanPhamChiTietRepository.findById(gioHangDTO.getIdSanPhamChiTiet())
                .orElseThrow(() -> new RuntimeException("SanPhamChiTiet not found"));


        for (GioHang gioHang : lstGioHang){
            if(gioHang.getSanPhamChiTiet().getId().equals(gioHangDTO.getIdSanPhamChiTiet())){
                gioHang.setSoLuong(gioHangDTO.getSoLuong()+gioHang.getSoLuong());
            }
        }
            GioHang newGioHang = new GioHang();
            newGioHang.setId(null);
            newGioHang.setKhachHang(khachHang);
            newGioHang.setTongGia(gioHangDTO.getTongGia());
            newGioHang.setNgayTao(LocalDate.now());
            newGioHang.setNgaySua(gioHangDTO.getNgaySua());
            newGioHang.setSoLuong(gioHangDTO.getSoLuong());
            newGioHang.setGiaSauGiam(gioHangDTO.getGiaSauGiam());
            newGioHang.setSanPhamChiTiet(sanPhamChiTiet);

            return gioHangRepository.save(newGioHang);
    }


    @Override
    public GioHang updateGioHang(int id,GioHangDTO gioHangDTO) {
        GioHang gioHang = gioHangRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("GioHang not found"));

        KhachHang khachHang = khachHangRepository.findById(gioHangDTO.getIdKhachHang())
                .orElseThrow(() -> new RuntimeException("KhachHang not found"));

        SanPhamChiTiet sanPhamChiTiet = sanPhamChiTietRepository.findById(gioHangDTO.getIdSanPhamChiTiet())
                .orElseThrow(() -> new RuntimeException("SanPhamChiTiet not found"));

            gioHang.setTongGia(gioHangDTO.getTongGia());
            gioHang.setNgaySua(LocalDate.now());
            gioHang.setSoLuong(gioHangDTO.getSoLuong());
            gioHang.setGiaSauGiam(gioHangDTO.getGiaSauGiam());
            gioHang.setSanPhamChiTiet(sanPhamChiTiet);

        return gioHangRepository.save(gioHang);
    }

    @Override
    public List<GioHang> getGioHangByIdKhachHang(int id) {
        return gioHangRepository.findGioHangsByKhachHang_Id(id);
    }

    @Override
    public void deleteGioHangByIdKhachHang(int id) {
        gioHangRepository.deleteById(id);
    }

    @Override
    public Page<GioHang> getAllGioHang(Pageable pageable) {
        return gioHangRepository.findAll(pageable);
    }
}

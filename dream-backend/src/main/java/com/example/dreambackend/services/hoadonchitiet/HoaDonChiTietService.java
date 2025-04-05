package com.example.dreambackend.services.hoadonchitiet;

import com.example.dreambackend.entities.HoaDon;
import com.example.dreambackend.entities.HoaDonChiTiet;
import com.example.dreambackend.entities.SanPhamChiTiet;
import com.example.dreambackend.repositories.HoaDonChiTietRepository;
import com.example.dreambackend.repositories.HoaDonRepository;
import com.example.dreambackend.repositories.SanPhamChiTietRepository;
import com.example.dreambackend.requests.HoaDonChiTietRequest;
import com.example.dreambackend.requests.HoaDonChiTietSearchRequest;
import com.example.dreambackend.responses.HoaDonChiTietResponse;
import jakarta.persistence.EntityManager;
import jakarta.transaction.Transactional;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.Optional;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
public class HoaDonChiTietService implements IHoaDonChiTietService {

    @Autowired
    private HoaDonChiTietRepository hdctRepository;
    @Autowired
    private HoaDonRepository hoaDonRepository;
    @Autowired
    private SanPhamChiTietRepository spctRepository;
    @Autowired
    private EntityManager em;

    private static final DateTimeFormatter DATE_FORMATTER = DateTimeFormatter.ofPattern("yyyy-MM-dd");

    @Override
    @Transactional(rollbackOn = Exception.class)
    public HoaDonChiTietResponse addSanPhamToHoaDon(Integer hoaDonId, Integer sanPhamChiTietId, Integer soLuong) {
        HoaDon hoaDon = hoaDonRepository.findById(hoaDonId)
                .orElseThrow(() -> new RuntimeException("Hóa đơn không tồn tại"));
        SanPhamChiTiet spct = spctRepository.findById(sanPhamChiTietId)
                .orElseThrow(() -> new RuntimeException("Sản phẩm chi tiết không tồn tại"));

        if (spct.getSoLuong() < soLuong) {
            throw new RuntimeException("Số lượng vượt quá tồn kho");
        }

        Optional<HoaDonChiTiet> existingHdct = hdctRepository.findByHoaDonAndSanPhamChiTiet(hoaDon, spct);

        HoaDonChiTiet savedHdct;
        if (existingHdct.isPresent()) {
            HoaDonChiTiet hdct = existingHdct.get();
            hdct.setSoLuong(hdct.getSoLuong() + soLuong);
            hdct.setNgaySua(LocalDate.now());
            savedHdct = hdctRepository.save(hdct);
        } else {
            HoaDonChiTiet newHdct = HoaDonChiTiet.builder()
                    .hoaDon(hoaDon)
                    .sanPhamChiTiet(spct)
                    .ma(UUID.randomUUID().toString().substring(0, 4))
                    .soLuong(soLuong)
                    .donGia(Optional.ofNullable(spct.getGia()).orElse(0.0))
                    .ngayTao(LocalDate.now())
                    .trangThai(1)
                    .build();
            savedHdct = hdctRepository.save(newHdct);
        }

        spct.setSoLuong(spct.getSoLuong() - soLuong);
        spctRepository.save(spct);

        return convertToDTO(savedHdct);
    }

    @Override
    public HoaDonChiTietResponse updateHoaDonChiTiet(Integer id, Integer soLuong) {
        HoaDonChiTiet hdct = hdctRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Chi tiết hóa đơn không tồn tại"));

        SanPhamChiTiet spct = hdct.getSanPhamChiTiet();
        int soLuongThayDoi = soLuong - hdct.getSoLuong();

        if (soLuongThayDoi > 0) {
            if ((spct.getSoLuong()+soLuongThayDoi) < soLuongThayDoi) {
                throw new RuntimeException("Số lượng vượt quá tồn kho");
            }
            spct.setSoLuong(spct.getSoLuong() - soLuongThayDoi);
        } else if (soLuongThayDoi < 0) {
            spct.setSoLuong(spct.getSoLuong() - soLuongThayDoi);
        }

        spctRepository.save(spct);

        hdct.setSoLuong(soLuong);
        hdct.setNgaySua(LocalDate.now());

        return convertToDTO(hdctRepository.save(hdct));
    }


    @Override
    public void removeSanPhamFromHoaDon(Integer id) {
        HoaDonChiTiet hdct = hdctRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Chi tiết hóa đơn không tồn tại"));

        SanPhamChiTiet spct = hdct.getSanPhamChiTiet();
        spct.setSoLuong(spct.getSoLuong() + hdct.getSoLuong());
        spctRepository.save(spct);

        hdctRepository.delete(hdct);
    }

    @Override
    public HoaDonChiTietResponse findById(Integer id) {
        HoaDonChiTiet hdct = hdctRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Chi tiết hóa đơn không tồn tại"));
        return convertToDTO(hdct);
    }

    @Override
    public List<HoaDonChiTietResponse> findByHoaDon(HoaDon hoaDon) {
        List<HoaDonChiTiet> list = hdctRepository.findByHoaDon(hoaDon);
        return list.stream().map(this::convertToDTO).collect(Collectors.toList());
    }

    @Override
    public List<HoaDonChiTietResponse> search(HoaDonChiTietSearchRequest searchRequest) {
        return hdctRepository.search(searchRequest, em);
    }

    private LocalDate parseDate(String dateString) {
        return (dateString != null && !dateString.isEmpty()) ? LocalDate.parse(dateString, DATE_FORMATTER) : LocalDate.now();
    }

    private HoaDonChiTiet convertToEntity(HoaDonChiTietRequest request) {
        HoaDon hoaDon = hoaDonRepository.findById(request.getIdHoaDon())
                .orElseThrow(() -> new RuntimeException("Hóa đơn không tồn tại"));
        SanPhamChiTiet spct = spctRepository.findById(request.getIdSanPhamChiTiet())
                .orElseThrow(() -> new RuntimeException("Sản phẩm chi tiết không tồn tại"));

        return HoaDonChiTiet.builder()
                .hoaDon(hoaDon)
                .sanPhamChiTiet(spct)
                .ma(request.getMa())
                .soLuong(request.getSoLuong())
                .donGia(Optional.ofNullable(request.getDonGia()).orElse(0.0))
                .ngayTao(parseDate(request.getNgayTao()))
                .ngaySua(parseDate(request.getNgaySua()))
                .trangThai(request.getTrangThai())
                .build();
    }

    private HoaDonChiTietResponse convertToDTO(HoaDonChiTiet hdct) {
        return HoaDonChiTietResponse.builder()
                .idHoaDon(hdct.getHoaDon().getId())
                .idSanPhamChiTiet(hdct.getSanPhamChiTiet().getId())
                .ma(hdct.getMa())
                .soLuong(hdct.getSoLuong())
                .gia(hdct.getDonGia())
                .ngayTao(hdct.getNgayTao())
                .ngaySua(hdct.getNgaySua())
                .trangThai(hdct.getTrangThai())
                .build();
    }
}
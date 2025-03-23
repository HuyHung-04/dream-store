package com.example.dreambackend.services.hoadon;

import com.example.dreambackend.dtos.DataTableResults;
import com.example.dreambackend.entities.*;
import com.example.dreambackend.repositories.*;
import com.example.dreambackend.requests.HoaDonRequest;
import com.example.dreambackend.requests.HoaDonSearchRequest;
import com.example.dreambackend.responses.HoaDonResponse;
import jakarta.persistence.EntityManager;
import jakarta.persistence.PersistenceContext;
import jakarta.transaction.Transactional;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.List;
import java.util.Objects;

@Service
public class HoaDonService implements IHoaDonService {

    @Autowired
    private HoaDonRepository hoaDonRepository;
    @Autowired
    private KhachHangRepository khachHangRepository;
    @Autowired
    private NhanVienRepository nhanVienRepository;
    @Autowired
    private VoucherRepository voucherRepository;
    @Autowired
    private PhuongThucThanhToanRepository ptttRepository;
    @Autowired
    private HoaDonChiTietRepository hoaDonChiTietRepository;
    @Autowired
    private SanPhamChiTietRepository sanPhamChiTietRepository;

    private static final DateTimeFormatter DATE_FORMATTER = DateTimeFormatter.ofPattern("yyyy-MM-dd");

    @Override
    @Transactional(rollbackOn = Exception.class)
    public HoaDonResponse updateHoaDon(Integer id, HoaDonRequest request) {
        HoaDon hoaDon = hoaDonRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Hóa đơn không tồn tại"));

        // Cập nhật thông tin chung của hóa đơn
        updateHoaDonInfo(hoaDon, request);

        // Cập nhật voucher (nếu có)
        if (request.getIdVoucher() != null) {
            updateVoucherForHoaDon(hoaDon, request.getIdVoucher());
        }

        return convertToDTO(hoaDonRepository.save(hoaDon));
    }

    private void updateHoaDonInfo(HoaDon hoaDon, HoaDonRequest request) {
        hoaDon.setTenNguoiNhan(request.getTenNguoiNhan());
        hoaDon.setSdtNguoiNhan(request.getSdtNguoiNhan());
        hoaDon.setDiaChiNhanHang(request.getDiaChiNhanHang());
        hoaDon.setPhiVanChuyen(request.getPhiVanChuyen());
        hoaDon.setTongTienThanhToan(request.getTongTienThanhToan());
        hoaDon.setTongTienTruocVoucher(request.getTongTienTruocVoucher());
        hoaDon.setTrangThai(request.getTrangThai());
        hoaDon.setNgaySua(LocalDate.now());
    }

    private void updateVoucherForHoaDon(HoaDon hoaDon, Integer idVoucher) {
        Voucher newVoucher = voucherRepository.findById(idVoucher)
                .orElseThrow(() -> new RuntimeException("Voucher không tồn tại"));

        Voucher oldVoucher = hoaDon.getVoucher();

        if (!Objects.equals(oldVoucher, newVoucher)) {
            if (oldVoucher != null) {
                oldVoucher.setSoLuong(oldVoucher.getSoLuong() + 1);
                voucherRepository.save(oldVoucher);
            }

            if (newVoucher.getSoLuong() <= 0) {
                throw new RuntimeException("Voucher đã hết số lượng");
            }

            newVoucher.setSoLuong(newVoucher.getSoLuong() - 1);
            voucherRepository.save(newVoucher);

            hoaDon.setVoucher(newVoucher);
        }
    }


    @Override
    public HoaDonResponse createHoaDon(HoaDonRequest request) {
        HoaDon hoaDon = convertToEntity(request);
        String maHoaDon = generateMaHoaDon();
        hoaDon.setMa(maHoaDon);
        HoaDon savedHoaDon = hoaDonRepository.save(hoaDon);
        return convertToDTO(savedHoaDon);
    }

    @Override
    public HoaDonResponse findById(Integer id) {
        HoaDon hoaDon = hoaDonRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy hóa đơn"));
        return convertToDTO(hoaDon);
    }
    @PersistenceContext
    private EntityManager em;
    @Override
    public DataTableResults<HoaDonResponse> getAllHoaDon(HoaDonSearchRequest request) {
        List<HoaDonResponse> list = hoaDonRepository.search(request,em);
        DataTableResults<HoaDonResponse> results = new DataTableResults<>();
        results.setData(list);
        if (!list.isEmpty()) {
            results.setRecordsTotal(request.getTotalRecords());
        } else {
            results.setRecordsTotal(0);
        }
        return results;
    }

    @Override
    @Transactional(rollbackOn = Exception.class)
    public void cancelHoaDon(Integer id,String ghiChu) {
        HoaDon hoaDon = hoaDonRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Hoá đơn không tồn tại"));

        if (hoaDon.getTrangThai() ==1 || hoaDon.getTrangThai() == 6) {
            hoaDon.setTrangThai(5);
            if (hoaDon.getTrangThai() == 1) {
                hoaDon.setGhiChu(ghiChu);
            }
            hoaDonRepository.save(hoaDon);

            List<HoaDonChiTiet> list = hoaDonChiTietRepository.findByHoaDonId(id);
            for (HoaDonChiTiet hdct : list) {
                SanPhamChiTiet spct = hdct.getSanPhamChiTiet();
                spct.setSoLuong(spct.getSoLuong() + hdct.getSoLuong());
                sanPhamChiTietRepository.save(spct);
            }

            if (hoaDon.getVoucher() != null) {
                Voucher voucher = hoaDon.getVoucher();
                voucher.setSoLuong(voucher.getSoLuong() + 1);
                voucherRepository.save(voucher);
            }
        } else{
            throw new RuntimeException("Không thể huỷ hoá đơn");
        }
    }

    private HoaDon convertToEntity(HoaDonRequest request) {
        KhachHang khachHang = khachHangRepository.findById(request.getIdKhachHang())
                .orElseThrow(() -> new RuntimeException("Khách hàng không tồn tại"));
        NhanVien nhanVien = nhanVienRepository.findById(request.getIdNhanVien())
                .orElseThrow(() -> new RuntimeException("Nhân viên không tồn tại"));
        PhuongThucThanhToan pttt = ptttRepository.findById(request.getIdPhuongThucThanhToan())
                .orElseThrow(() -> new RuntimeException("Phương thức thanh toán không tồn tại"));

        Voucher voucher = null;
        if (request.getIdVoucher() != null) {
            voucher = voucherRepository.findById(request.getIdVoucher())
                    .orElseThrow(() -> new RuntimeException("Voucher không tồn tại"));
        }

        return HoaDon.builder()
                .ma(generateMaHoaDon())
                .khachHang(khachHang)
                .nhanVien(nhanVien)
                .phuongThucThanhToan(pttt)
                .voucher(voucher)
                .tenNguoiNhan(request.getTenNguoiNhan())
                .sdtNguoiNhan(request.getSdtNguoiNhan())
                .diaChiNhanHang(request.getDiaChiNhanHang())
                .hinhThucThanhToan(request.getHinhThucThanhToan())
                .phiVanChuyen(request.getPhiVanChuyen())
                .tongTienTruocVoucher(request.getTongTienTruocVoucher())
                .tongTienThanhToan(request.getTongTienThanhToan())
                .ngayNhanDuKien(request.getNgayNhanDuKien())
                .ngayTao(request.getNgayTao())
                .ngaySua(request.getNgaySua())
                .trangThai(request.getTrangThai() != null ? request.getTrangThai() : 1)
                .ghiChu(request.getGhiChu())
                .build();
    }

    private HoaDonResponse convertToDTO(HoaDon hoaDon) {
        return HoaDonResponse.builder()
                .id(hoaDon.getId())
                .idKhachHang(hoaDon.getKhachHang().getId())
                .idNhanVien(hoaDon.getNhanVien().getId())
                .idVoucher(hoaDon.getVoucher() != null ? hoaDon.getVoucher().getId() : null)
                .idPhuongThucThanhToan(hoaDon.getPhuongThucThanhToan().getId())
                .maHoaDon(hoaDon.getMa())
                .tenNguoiNhan(hoaDon.getTenNguoiNhan())
                .sdtNguoiNhan(hoaDon.getSdtNguoiNhan())
                .diaChiNhanHang(hoaDon.getDiaChiNhanHang())
                .hinhThucThanhToan(hoaDon.getHinhThucThanhToan())
                .phiVanChuyen(hoaDon.getPhiVanChuyen())
                .tongTienTruocVoucher(hoaDon.getTongTienTruocVoucher())
                .tongTienThanhToan(hoaDon.getTongTienThanhToan())
                .ngayNhanDuKien(hoaDon.getNgayNhanDuKien())
                .ngayTao(hoaDon.getNgayTao())
                .ngaySua(hoaDon.getNgaySua())
                .trangThai(hoaDon.getTrangThai())
                .ghiChu(hoaDon.getGhiChu())
                .build();
    }

    private LocalDate parseDate(String dateString) {
        return (dateString != null && !dateString.isEmpty()) ? LocalDate.parse(dateString, DATE_FORMATTER) : LocalDate.now();
    }

    private String generateMaHoaDon() {
        String ma;
        do {
            int randomNum = (int) (Math.random() * 9000) + 1000; // Tạo số ngẫu nhiên từ 1000 - 9999
            ma = "HD" + randomNum;
        } while (hoaDonRepository.findByMa(ma).isPresent()); // Kiểm tra trùng mã trong DB
        return ma;
    }
}
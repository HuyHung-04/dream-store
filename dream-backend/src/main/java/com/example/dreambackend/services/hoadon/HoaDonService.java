package com.example.dreambackend.services.hoadon;

import com.example.dreambackend.dtos.DataTableResults;
import com.example.dreambackend.dtos.SanPhamThieuDto;
import com.example.dreambackend.entities.*;
import com.example.dreambackend.repositories.*;
import com.example.dreambackend.requests.HoaDonRequest;
import com.example.dreambackend.requests.HoaDonSearchRequest;
import com.example.dreambackend.responses.HoaDonResponse;
import jakarta.persistence.EntityManager;
import jakarta.persistence.PersistenceContext;
import jakarta.transaction.Transactional;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
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
        hoaDon.setTenNguoiNhan(request.getTenNguoiNhan());
        hoaDon.setSdtNguoiNhan(request.getSdtNguoiNhan());
        hoaDon.setNgaySua(LocalDate.now());
        updateHoaDonInfo(hoaDon, request);

        if (request.getIdVoucher() != null) {
            updateVoucherForHoaDon(hoaDon, request.getIdVoucher());
        } else {
            hoaDon.setVoucher(null); // Nếu không có voucher thì gỡ bỏ
        }

        if (request.getIdPhuongThucThanhToan() != null) {
            PhuongThucThanhToan phuongThucThanhToan = ptttRepository.findById(request.getIdPhuongThucThanhToan()).orElse(null);
            hoaDon.setPhuongThucThanhToan(phuongThucThanhToan);
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
        hoaDon.setPhuongThucThanhToan(ptttRepository.findById(request.getIdPhuongThucThanhToan()).orElse(null));
        hoaDon.setTrangThai(request.getTrangThai());
        hoaDon.setNgaySua(LocalDate.now());
    }


    private void updateVoucherForHoaDon(HoaDon hoaDon, Integer idVoucher) {

        Voucher newVoucher = voucherRepository.findById(idVoucher)
                .orElseThrow(() -> new RuntimeException("Voucher không tồn tại"));

        // Kiểm tra trạng thái của voucher
        if (newVoucher.getTrangThai() != null && newVoucher.getTrangThai() == 0) {
            hoaDon.setVoucher(null);
            throw new RuntimeException("Voucher đã ngừng hoạt động, vui lòng chọn voucher khác");
        }

        if (newVoucher.getSoLuong() <= 0) {
            hoaDon.setVoucher(null);
            throw new RuntimeException("Voucher đã hết số lượt sử dụng");
        }

        // Chỉ trừ số lượng khi trạng thái hóa đơn là 7
        if (hoaDon.getTrangThai() != null && hoaDon.getTrangThai() == 7) {
            newVoucher.setSoLuong(newVoucher.getSoLuong() - 1);
            voucherRepository.save(newVoucher);
            hoaDon.setVoucher(newVoucher);
        } else {
            // Gán voucher nhưng không trừ số lượng nếu chưa đến trạng thái 7
            hoaDon.setVoucher(newVoucher);
        }
    }



    @Override
    public HoaDonResponse createHoaDon(HoaDonRequest request) {
        List<HoaDon> hoaDons = hoaDonRepository.findAllByTrangThai(6);
        if (hoaDons.size() >= 5) {
            throw new RuntimeException("Hoá đơn chờ đã đạt số lượng tối đa");
        }
        HoaDon hoaDon = convertToEntity(request);
        hoaDon.setTenNguoiNhan(request.getTenNguoiNhan());
        hoaDon.setSdtNguoiNhan(request.getSdtNguoiNhan());
        hoaDon.setNgayTao(LocalDate.now());
        hoaDon.setNgaySua(LocalDate.now());
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
    public DataTableResults<HoaDonResponse> getAllHoaDon(HoaDonSearchRequest request, Integer idNhanVien) {
        List<HoaDonResponse> list;

        if (idNhanVien != null) {
            list = hoaDonRepository.search(request, em, idNhanVien); // lọc theo nhân viên
        } else {
            list = hoaDonRepository.search(request, em, null); // không lọc theo nhân viên (hoặc xử lý trong repo)
        }

        DataTableResults<HoaDonResponse> results = new DataTableResults<>();
        results.setData(list);
        results.setRecordsTotal(!list.isEmpty() ? request.getTotalRecords() : 0);
        return results;
    }

    @Override
    @Transactional(rollbackOn = Exception.class)
    public void cancelHoaDon(Integer id,String ghiChu) {
        HoaDon hoaDon = hoaDonRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Hoá đơn không tồn tại"));

        if (hoaDon.getTrangThai() ==1 || hoaDon.getTrangThai() == 6) {
            hoaDon.setTrangThai(8);
            if (hoaDon.getTrangThai() == 1) {
                hoaDon.setGhiChu(ghiChu);
            }
            hoaDon.setNgaySua(LocalDate.now());
            hoaDonRepository.save(hoaDon);

            List<HoaDonChiTiet> list = hoaDonChiTietRepository.findByHoaDonId(id);
            for (HoaDonChiTiet hdct : list) {
                SanPhamChiTiet spct = hdct.getSanPhamChiTiet();
                spct.setSoLuong(spct.getSoLuong() + hdct.getSoLuong());
                sanPhamChiTietRepository.save(spct);
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
                .phiVanChuyen(request.getPhiVanChuyen())
                .tongTienTruocVoucher(request.getTongTienTruocVoucher())
                .tongTienThanhToan(request.getTongTienThanhToan())
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
                .phiVanChuyen(hoaDon.getPhiVanChuyen())
                .tongTienTruocVoucher(hoaDon.getTongTienTruocVoucher())
                .tongTienThanhToan(hoaDon.getTongTienThanhToan())
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
            int randomNum = (int) (Math.random() * 90000000) + 10000000; // Tạo số ngẫu nhiên từ 1000 - 9999
            ma = "HD" + randomNum;
        } while (hoaDonRepository.findByMa(ma).isPresent()); // Kiểm tra trùng mã trong DB
        return ma;
    }

    // Lọc hóa đơn theo trạng thái và phân trang
    public Page<HoaDon> getHoaDonsByTrangThaiAndNguoiNhanAndMa(Integer trangThai, String tenNguoiNhan, String sdtNguoiNhan, String maHoaDon, int page, int size) {
        Pageable pageable = PageRequest.of(page, size);
        return hoaDonRepository.findByTrangThaiAndNguoiNhanAndMa(trangThai, tenNguoiNhan, sdtNguoiNhan, maHoaDon, pageable);
    }

    @Transactional
    public String cancelHoaDonsByNhanVienId(Integer idNhanVien) {
        List<HoaDon> hoaDons = hoaDonRepository.findByTrangThaiAndNhanVienId(6, idNhanVien);
        int count = 0;

        for (HoaDon hoaDon : hoaDons) {
            // Cập nhật trạng thái hóa đơn
            hoaDon.setTrangThai(8);
            hoaDonRepository.save(hoaDon);

            // Lấy chi tiết hóa đơn
            List<HoaDonChiTiet> chiTiets = hoaDonChiTietRepository.findByHoaDonId(hoaDon.getId());

            for (HoaDonChiTiet chiTiet : chiTiets) {
                SanPhamChiTiet sanPham = chiTiet.getSanPhamChiTiet();
                if (sanPham != null) {
                    int soLuongHoan = chiTiet.getSoLuong();
                    sanPham.setSoLuong(sanPham.getSoLuong() + soLuongHoan);
                    sanPhamChiTietRepository.save(sanPham);
                }
            }

            count++;
        }

        return "Đã hủy " + count + " hóa đơn và hoàn lại số lượng sản phẩm.";
    }

    @Override
    public String assignHoaDonToNewNhanVien(Integer idNhanVienCu, Integer idNhanVienMoi) {
        List<HoaDon> hoaDonCuaNhanVienCu = hoaDonRepository.findByTrangThaiAndNhanVienId(6, idNhanVienCu);
        List<HoaDon> hoaDonCuaNhanVienMoi = hoaDonRepository.findByTrangThaiAndNhanVienId(6, idNhanVienMoi);

        int tongHoaDon = hoaDonCuaNhanVienCu.size() + hoaDonCuaNhanVienMoi.size();
        if (tongHoaDon > 5) {
            throw new RuntimeException("Hiện tại số đơn của nhân viên bàn giao vượt quá 5 đơn. Vui lòng chọn nhân viên khác");
        }

        if (hoaDonCuaNhanVienCu.isEmpty()) {
            throw new RuntimeException("Không tìm thấy hóa đơn với trạng thái = 6 của nhân viên cũ.");
        }

        NhanVien nhanVienMoi = nhanVienRepository.findById(idNhanVienMoi).orElse(null);
        if (nhanVienMoi == null) {
            throw new RuntimeException("Không tìm thấy nhân viên mới với ID = " + idNhanVienMoi);
        }

        for (HoaDon hoaDon : hoaDonCuaNhanVienCu) {
            hoaDon.setNhanVien(nhanVienMoi);
        }

        hoaDonRepository.saveAll(hoaDonCuaNhanVienCu);

        return "Đã chuyển " + hoaDonCuaNhanVienCu.size() + " hóa đơn sang nhân viên mới.";
    }

    public List<SanPhamThieuDto> getSanPhamThieu() {
        return hoaDonChiTietRepository.findSanPhamTrongDonChuaXacNhan();
    }
}
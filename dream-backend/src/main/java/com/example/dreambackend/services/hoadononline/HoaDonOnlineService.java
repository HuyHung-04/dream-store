package com.example.dreambackend.services.hoadononline;
import java.time.LocalDateTime;
import java.util.*;

import com.example.dreambackend.dtos.HoaDonChiTietDto;
import com.example.dreambackend.dtos.HoaDonDto;
import com.example.dreambackend.dtos.VoucherDto;
import com.example.dreambackend.entities.*;
import com.example.dreambackend.repositories.*;
import com.example.dreambackend.requests.GioHangChiTietRequest;
import com.example.dreambackend.requests.HoaDonOnlineRequest;
import com.example.dreambackend.responses.GioHangChiTietResponse;
import jakarta.transaction.Transactional;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.stream.Collectors;

@Service
public class HoaDonOnlineService implements IHoaDonOnlineService {

    @Autowired
    private GioHangChiTietRepository gioHangChiTietRepository;

    @Autowired
    KhachHangRepository khachHangRepository;

    @Autowired
    SanPhamChiTietRepository sanPhamChiTietRepository;

    @Autowired
    private HoaDonRepository hoaDonRepository;

    @Autowired
    AnhRepository anhRepository;

    @Autowired
    HoaDonChiTietRepository hoaDonChiTietRepository;

    @Autowired
    VoucherRepository voucherRepository;

    @Autowired
    PhuongThucThanhToanRepository phuongThucThanhToanRepository;

    @Transactional
    @Override
    public List<GioHangChiTietResponse> getGioHangIdsForThanhToan(Integer idKhachHang) {
        // Xóa giỏ hàng có trạng thái 2
        gioHangChiTietRepository.deleteByKhachHangIdAndTrangThai(idKhachHang, 2);

        // Lấy danh sách giỏ hàng
        List<GioHangChiTietResponse> gioHangChiTietList = gioHangChiTietRepository.findGioHangChiTietByKhachHangId(idKhachHang);

        if (gioHangChiTietList.isEmpty()) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "TRONG: Số lượng sản phẩm này đã hết vui lòng chọn sản phẩm khác");
        }

        for (GioHangChiTietResponse item : gioHangChiTietList) {
            Integer idSanPhamChiTiet = item.getIdSanPhamChiTiet();
            Integer soLuongTrongGio = item.getSoLuong();

            SanPhamChiTiet spChiTiet = sanPhamChiTietRepository.findById(idSanPhamChiTiet)
                    .orElse(null);

            Integer soLuongTon = sanPhamChiTietRepository.findById(idSanPhamChiTiet)
                    .map(sp -> sp.getSoLuong())
                    .orElse(0);

            String tenSanPham = item.getTenSanPham();
            String mauSac = item.getMau();
            String size = item.getSize();

            if (spChiTiet.getTrangThai() == 0) {
                throw new ResponseStatusException(
                        HttpStatus.BAD_REQUEST,
                        "NGUNG_HOAT_DONG: Sản phẩm \"" + tenSanPham + " (" + mauSac + ", " + size + ")\" đã ngưng hoạt động. Vui lòng chọn sản phẩm khác."
                );
            }
            // Nếu sản phẩm hết hàng
            if (soLuongTon == 0) {
                throw new ResponseStatusException(
                        HttpStatus.BAD_REQUEST,
                        "HET_HANG:Sản phẩm \"" + tenSanPham + " (" + mauSac + ", " + size + ")\" đã hết hàng. Vui lòng chọn sản phẩm khác."
                );
            }

            // Nếu số lượng trong giỏ vượt quá tồn kho
            if (soLuongTrongGio > soLuongTon) {
                throw new ResponseStatusException(
                        HttpStatus.BAD_REQUEST,
                        "VUOT_TON:Sản phẩm \"" + tenSanPham + " (" + mauSac + ", " + size + ")\" vượt quá số lượng tồn kho. Chỉ còn lại " + soLuongTon + " sản phẩm."
                );
            }
        }


        return gioHangChiTietList; // Trả về danh sách chứa: tên sản phẩm, số lượng, giá, tổng tiền
    }


    @Override
    public List<GioHangChiTietResponse> getChiTietGioHangSauThanhToan(Integer idKhachHang) {
        return gioHangChiTietRepository.findGioHangChiTietByStatus(idKhachHang);
    }

//    @Override
//    public Double getTamTinh(Integer idKhachHang) {
//        // Lấy danh sách giỏ hàng chi tiết theo trạng thái và khách hàng
//        List<GioHangChiTietResponse> gioHangChiTietResponses = gioHangChiTietRepository.findGioHangChiTietByStatus(idKhachHang);
//
//        Double totalPrice = 0.0;
//
//        // Duyệt qua danh sách và tính tổng tiền nếu trạng thái giỏ hàng là 0 hoặc 2
//        for (GioHangChiTietResponse item : gioHangChiTietResponses) {
//            if (item.getTrangThai() == 0 || item.getTrangThai() == 2) {
//                totalPrice += item.getDonGia() * item.getSoLuong(); // Tính tổng theo số lượng và đơn giá
//            }
//        }
//
//        return totalPrice;
//    }

    @Override
    public List<VoucherDto> getVoucherIdAndTen(Double tongTien) {
        // Lấy tất cả voucher từ database
        List<VoucherDto> allVouchers = voucherRepository.findIdAndTen();

        // Lọc danh sách voucher dựa trên đơn tối thiểu và ngày kết thúc
        return allVouchers.stream()
                .filter(voucher -> {
                    // Lấy voucher chi tiết từ database để kiểm tra ngày kết thúc
                    Voucher voucherEntity = voucherRepository.findById(voucher.getId()).orElse(null);
                    if (voucherEntity != null) {
                        // Chuyển ngày kết thúc thành LocalDateTime 23:59:59 để so sánh
                        LocalDateTime endOfDay = voucherEntity.getNgayKetThuc().atTime(23, 59, 59);
                        // Kiểm tra điều kiện đơn tối thiểu và ngày kết thúc
                        return tongTien >= voucherEntity.getDonToiThieu().doubleValue() &&
                                !LocalDateTime.now().isAfter(endOfDay);
                    }
                    return false;
                })
                .collect(Collectors.toList());
    }



//    @Override
//    public Double getTongTienThanhToan(Integer idKhachHang, Integer voucherId, Double shippingFee) {
//        // Lấy chi tiết giỏ hàng của khách hàng
//        List<GioHangChiTietResponse> gioHangChiTietResponses = gioHangChiTietRepository.findGioHangChiTietByStatus(idKhachHang);
//
//        // Tính tổng tiền giỏ hàng
//        Double tamTinh = 0.0;
//        for (GioHangChiTietResponse item : gioHangChiTietResponses) {
//            tamTinh += item.getDonGia() * item.getSoLuong();
//        }
//
//        Double giamGia = 0.0;
//
//        // Nếu có voucherId thì mới xử lý giảm giá
//        if (voucherId != null) {
//            Voucher voucher = voucherRepository.findById(voucherId)
//                    .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Voucher không tồn tại"));
//
//            if (voucher.isHinhThucGiam()) {
//                // Giảm theo số tiền cố định
//                giamGia = voucher.getGiaTriGiam().doubleValue();
//            } else {
//                // Giảm theo phần trăm
//                giamGia = tamTinh * voucher.getGiaTriGiam().doubleValue() / 100;
//
//                // Giảm tối đa chỉ áp dụng cho giảm theo phần trăm
//                if (voucher.getGiamToiDa() != null && giamGia > voucher.getGiamToiDa().doubleValue()) {
//                    giamGia = voucher.getGiamToiDa().doubleValue();
//                }
//            }
//        }
//
//        // Tổng tiền sau giảm = tổng - giảm + ship
//        Double tongTienThanhToan = (tamTinh - giamGia) + shippingFee;
//
//        return tongTienThanhToan;
//    }

    @Override
    @Transactional
    public HoaDon createHoaDon(HoaDonOnlineRequest request) {
        if (request == null || request.getChiTietGioHang() == null || request.getChiTietGioHang().isEmpty()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "KHONG_CO_SAN_PHAM: Không có sản phẩm nào được chọn để thanh toán.");
        }
        Integer idKhachHang = request.getIdKhachHang();
        Integer paymentMethodId = request.getPaymentMethodId();
        Double tongTienTruocGiam = request.getTongTienTruocGiam();
        Double tongTienSauGiam = request.getTongTienSauGiam();
        String tenNguoiNhan = request.getTenNguoiNhan();
        String sdtNguoiNhan = request.getSdtNguoiNhan();
        String diaChi = request.getDiaChi();
        Double shippingFee = request.getShippingFee();
        Integer voucherId = request.getVoucherId();
        List<GioHangChiTietRequest> gioHangChiTietRequests = request.getChiTietGioHang();

        KhachHang khachHang = khachHangRepository.findById(idKhachHang)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Khách hàng không tồn tại"));

        PhuongThucThanhToan phuongThuc = phuongThucThanhToanRepository.findById(paymentMethodId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Phương thức thanh toán không tồn tại"));

        Voucher voucher = null;
        if (voucherId != null) {
            voucher = voucherRepository.findById(voucherId)
                    .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Voucher không tồn tại"));
        }

        if (paymentMethodId == 4) {
            if ( voucher != null && voucher.getTrangThai() == 0) {
                throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "VOUCHER_KHONG_HOAT_DONG: Voucher hiện tại không hoạt động");
            }
            if (voucher != null && voucher.getSoLuong() <= 0) {
                throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "VOUCHER_HET: Voucher hiện tại đã hết lượt sử dụng");
            }

            for (GioHangChiTietRequest item : gioHangChiTietRequests) {
                SanPhamChiTiet spct = sanPhamChiTietRepository.findById(item.getIdSanPhamChiTiet())
                        .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Sản phẩm chi tiết không tồn tại"));

                String thongTinSanPham = spct.getSanPham().getTen() + " (" + spct.getSize().getTen() + "/ " + spct.getMauSac().getTen() + ")";

                if (spct.getTrangThai() == 0) {
                    gioHangChiTietRepository.deleteByKhachHangIdAndSanPhamChiTietIdAndTrangThai(khachHang.getId(), spct.getId(), 1);
                    throw new ResponseStatusException(HttpStatus.BAD_REQUEST,
                            "NGUNG_HOAT_DONG: Sản phẩm '" + thongTinSanPham + "' đã ngưng hoạt động. Vui lòng chọn sản phẩm khác.");
                }

                if (spct.getSoLuong() == 0) {
                    gioHangChiTietRepository.deleteByKhachHangIdAndSanPhamChiTietIdAndTrangThai(khachHang.getId(), spct.getId(), 1);
                    throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "HET_HANG: Sản phẩm '" + thongTinSanPham + "' hiện đã hết hàng. Vui lòng chọn sản phẩm khác ");
                }

                if (item.getSoLuong() > spct.getSoLuong()) {
                    throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "VUOT_TON: Sản phẩm '" + thongTinSanPham + "' không đủ số lượng. Chỉ còn lại " + spct.getSoLuong());
                }
            }
        }

        HoaDon hoaDon = new HoaDon();
        hoaDon.setKhachHang(khachHang);
        hoaDon.setMa("HD" + (System.currentTimeMillis() % 10000000));
        hoaDon.setNgayTao(LocalDate.now());
        hoaDon.setVoucher(voucher);
        hoaDon.setPhuongThucThanhToan(phuongThuc);
        hoaDon.setTenNguoiNhan(tenNguoiNhan);
        hoaDon.setSdtNguoiNhan(sdtNguoiNhan);
        hoaDon.setDiaChiNhanHang(diaChi);
        hoaDon.setPhiVanChuyen(shippingFee);
        hoaDon.setTongTienTruocVoucher(tongTienTruocGiam);
        hoaDon.setTongTienThanhToan(tongTienSauGiam);
        hoaDon.setTrangThai(paymentMethodId == 4 ? 2 : 1);
        if (voucher != null) {
            if (voucher.getTrangThai() == 0) {
                throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "VOUCHER_KHONG_HOAT_DONG: Voucher hiện tại không hoạt động");
            }
            if (voucher.getSoLuong() == 0) {
                throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "VOUCHER_HET: Voucher hiện tại đã hết lượt sử dụng");
            }
            int soLuongConLai = voucher.getSoLuong() - 1;
            voucher.setSoLuong(soLuongConLai);
            voucherRepository.save(voucher);
        }


        hoaDonRepository.save(hoaDon);

        boolean daXoaTrangThai2 = false;

        if (gioHangChiTietRequests != null && !gioHangChiTietRequests.isEmpty()) {
            for (GioHangChiTietRequest item : gioHangChiTietRequests) {
                SanPhamChiTiet spct = sanPhamChiTietRepository.findById(item.getIdSanPhamChiTiet())
                        .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Sản phẩm chi tiết không tồn tại"));

                // Lấy thông tin chi tiết sản phẩm
                String tenSanPham = spct.getSanPham().getTen();
                String tenMauSac = spct.getMauSac().getTen();
                String tenKichThuoc = spct.getSize().getTen();
                String thongTinSanPham = tenSanPham + " (" + tenKichThuoc + "/ " + tenMauSac + ")";

                if (spct.getTrangThai() == 0) {
                    gioHangChiTietRepository.deleteByKhachHangIdAndSanPhamChiTietIdAndTrangThai(khachHang.getId(), spct.getId(), 1);
                    throw new ResponseStatusException(HttpStatus.BAD_REQUEST,
                            "NGUNG_HOAT_DONG: Sản phẩm '" + thongTinSanPham + "' đã ngưng hoạt động. Vui lòng chọn sản phẩm khác.");
                }

                // Nếu sản phẩm hết hàng
                if (spct.getSoLuong() == 0) {
                    // Xóa sản phẩm đó khỏi giỏ hàng nếu đang ở trạng thái 2 (giỏ mua)
                    gioHangChiTietRepository.deleteByKhachHangIdAndSanPhamChiTietIdAndTrangThai(khachHang.getId(), spct.getId(), 1);
                    throw new ResponseStatusException(HttpStatus.BAD_REQUEST,
                            "HET_HANG:Sản phẩm '" + thongTinSanPham + "' hiện đã hết hàng. Vui lòng chọn sản phẩm khác");
                }

                // Nếu số lượng mua vượt quá số lượng tồn
                if (item.getSoLuong() > spct.getSoLuong()) {
                    throw new ResponseStatusException(HttpStatus.BAD_REQUEST,
                            "VUOT_TON:Sản phẩm '" + thongTinSanPham + "' không còn đủ số lượng để mua. Chỉ còn lại " + spct.getSoLuong() + " sản phẩm trong kho.");

                }

                if (paymentMethodId == 4) {
                    int soLuongConLai = spct.getSoLuong() - item.getSoLuong();
                    if (soLuongConLai < 0) {
                        throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Sản phẩm không đủ số lượng tồn");
                    }
                    spct.setSoLuong(soLuongConLai);
                    sanPhamChiTietRepository.save(spct);
                }

                HoaDonChiTiet hdct = new HoaDonChiTiet();
                hdct.setMa("HDCT" + System.currentTimeMillis());
                hdct.setHoaDon(hoaDon);
                hdct.setSanPhamChiTiet(spct);
                hdct.setSoLuong(item.getSoLuong());
                hdct.setDonGia(item.getDonGia());
                hoaDonChiTietRepository.save(hdct);

                Integer trangThaiItem = item.getTrangThai();
                Optional<GioHangChiTiet> gioHangChiTietOpt = gioHangChiTietRepository
                        .findByKhachHangIdAndSanPhamChiTietIdAndGioHang(khachHang.getId(), item.getIdSanPhamChiTiet(), trangThaiItem);

                if (gioHangChiTietOpt.isPresent()) {
                    GioHangChiTiet gioHangChiTiet = gioHangChiTietOpt.get();
                    int soLuongTrongGio = gioHangChiTiet.getSoLuong();
                    int soLuongMua = item.getSoLuong();

                    if (soLuongMua >= soLuongTrongGio) {
                        gioHangChiTietRepository.delete(gioHangChiTiet);
                    } else {
                        gioHangChiTiet.setSoLuong(soLuongTrongGio - soLuongMua);
                        gioHangChiTiet.setNgaySua(LocalDate.now());
                        gioHangChiTietRepository.save(gioHangChiTiet);
                    }
                }

                // Nếu là trạng thái 2, xóa hết giỏ hàng trạng thái 2 (1 lần duy nhất)
                if (trangThaiItem == 2 && !daXoaTrangThai2) {
                    gioHangChiTietRepository.deleteByKhachHangIdAndTrangThai(khachHang.getId(), 2);
                    daXoaTrangThai2 = true;
                }
            }
        } else {
            gioHangChiTietRepository.deleteByKhachHangIdAndTrangThai(khachHang.getId(), 2);
        }

        // Nếu thanh toán online, vẫn xóa giỏ trạng thái 2 để đảm bảo
        if (paymentMethodId == 4 && !daXoaTrangThai2) {
            gioHangChiTietRepository.deleteByKhachHangIdAndTrangThai(khachHang.getId(), 2);
        }

        return hoaDon;
    }






    public List<HoaDonChiTietDto> getHoaDonChiTiet(Integer idHoaDon) {
        // Lấy dữ liệu từ repository
        List<Object[]> results = hoaDonChiTietRepository.findHoaDonChiTietByMaHoaDon(idHoaDon);

        // Kiểm tra nếu không có dữ liệu
        if (results.isEmpty()) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Không tìm thấy hóa đơn chi tiết với mã: " + idHoaDon);
        }

        // Xử lý dữ liệu và map vào DTO
        List<HoaDonChiTietDto> chiTietDtos = new ArrayList<>();
        for (Object[] row : results) {
            String maSanPham = (String) row[0];
            String tenSanPham = (String) row[1];
            Integer soLuong = row[3] != null ? ((Number) row[3]).intValue() : 0;
            String mauSac = (String) row[4];
            String size = (String) row[5];
            String anhUrl = (String) row[6];
            Double donGia = row[2] != null ? ((Number) row[2]).doubleValue() : 0.0;
            List<String> anhUrls = anhUrl != null ? List.of(anhUrl) : List.of();
            // Thêm vào danh sách DTO
            HoaDonChiTietDto hoaDonChiTietDto = new HoaDonChiTietDto(
                    maSanPham, tenSanPham, donGia, soLuong, mauSac, size, anhUrls
            );
            chiTietDtos.add(hoaDonChiTietDto);
        }

        return chiTietDtos;
    }

    @Override
    public List<HoaDonDto> getHoaDonByKhachHang(Integer idKhachHang,Integer trangThai) {
        //lấy danh sách hóa đơn dựa trên id khách hàng và trạng thái để lọc trạng thái cho đơn hàng
        List<Object[]> result = hoaDonChiTietRepository.getHoaDonByKhachHangAndTrangThai(idKhachHang,trangThai);

        // Xử lý dữ liệu và map vào DTO
        List<HoaDonDto> hoaDonDtos = new ArrayList<>();
        for (Object[] row : result) {
            HoaDonDto hoaDonDto = new HoaDonDto();
            hoaDonDto.setIdHoaDon((Integer) row[0]);
            hoaDonDto.setMaHoaDon((String) row[1]);
            hoaDonDto.setTenNguoiNhan((String) row[2]);
            hoaDonDto.setSdtNguoiNhan((String) row[3]);
            hoaDonDto.setTrangThai((Integer) row[4]);
            hoaDonDto.setDiaChiNhanHang((String) row[5]);
            hoaDonDto.setTongTienThanhToan(row[6] != null ? (Double) row[6] : 0.0);
            hoaDonDto.setIdHoaDonChiTiet((Integer) row[7]);
            hoaDonDto.setMaSanPham((String) row[8]);
            hoaDonDto.setTenSanPham((String) row[9]);
            hoaDonDto.setSoLuong(row[10] != null ? (Integer) row[10] : 0);
            hoaDonDto.setMauSac((String) row[11]);
            hoaDonDto.setSize((String) row[13]);
            hoaDonDto.setAnhUrl((String) row[14]);
            hoaDonDto.setDonGia(row[12] != null ? (Double) row[12] : 0.0);
            hoaDonDtos.add(hoaDonDto);

        }
        return hoaDonDtos;
    }

    // Lấy hóa đơn với voucher, khách hàng và phương thức thanh toán
    public Optional<HoaDon> getHoaDon(Integer id) {
        return hoaDonRepository.findHoaDonWithDetailsByMa(id);
    }


    @Override
    public HoaDon huyHoaDon(Integer idHoaDon,String ghiChu) {

        HoaDon hoaDon = hoaDonRepository.huyHoaDon(idHoaDon)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Hóa đơn không tồn tại"));

        if (hoaDon.getTrangThai() == 2) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Không thể hủy hóa đơn ở trạng thái này");
        }

        // Nếu có voucher thì cộng 1 vào số lượng voucher
        Voucher voucher = hoaDon.getVoucher();
        if (voucher != null) {
            if (voucher.getSoLuong() == 0 && voucher.getTrangThai() == 0) {
                voucher.setTrangThai(1);
            }
            voucher.setSoLuong(voucher.getSoLuong() + 1);
            voucherRepository.save(voucher);
        }

        hoaDon.setTrangThai(9);
        hoaDon.setGhiChu(ghiChu);
        hoaDonRepository.save(hoaDon);
        return hoaDon;
    }
    @Transactional
    @Override
    public HoaDon tangTrangThaiHoaDon(Integer id) {
        Optional<HoaDon> optionalHoaDon = hoaDonRepository.findById(id);

        if (optionalHoaDon.isPresent()) {
            HoaDon hoaDon = optionalHoaDon.get();
            Integer trangThaiHienTai = hoaDon.getTrangThai();

            if (trangThaiHienTai != null && trangThaiHienTai < 5) {
                hoaDon.setTrangThai(trangThaiHienTai + 1); // Tăng trạng thái

                if (trangThaiHienTai == 1) {
                    // Tìm danh sách chi tiết hóa đơn
                    List<HoaDonChiTiet> hoaDonChiTietList = hoaDonChiTietRepository.findByHoaDonId(hoaDon.getId());

                    for (HoaDonChiTiet hct : hoaDonChiTietList) {
                        SanPhamChiTiet spct = hct.getSanPhamChiTiet();
                        if (spct != null) {
                            int soLuongTon = spct.getSoLuong();
                            int soLuongDat = hct.getSoLuong();

                            // Kiểm tra xem có đủ hàng không
                            if (soLuongTon >= soLuongDat) {
                                if (spct.getSoLuong() == 0) {
                                    throw new RuntimeException("Sản phẩm " + spct.getSanPham().getTen() + " (" + spct.getMa() + ") đã hết hàng. Vui lòng chọn sản phẩm khác.");
                                }
                                // Trừ số lượng trong kho
                                spct.setSoLuong(soLuongTon - soLuongDat);
                                sanPhamChiTietRepository.save(spct);
                            } else {
                                // Nếu không đủ số lượng, throw exception hoặc thông báo lỗi
                                throw new RuntimeException("Sản phẩm " + spct.getSanPham().getTen() + " (" + spct.getMa() + ") không đủ số lượng trong kho. Hiện tại chỉ còn " + spct.getSoLuong() + " sản phẩm");
                            }
                        }
                    }
                }

                if (trangThaiHienTai != null && trangThaiHienTai == 4) {
                    hoaDon.setNgaySua(LocalDate.now());
                }

                return hoaDonRepository.save(hoaDon);
            }

            return hoaDon;
        }
        return null; // Không tìm thấy hóa đơn
    }


}


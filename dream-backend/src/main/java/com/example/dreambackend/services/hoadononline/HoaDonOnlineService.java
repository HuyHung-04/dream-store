package com.example.dreambackend.services.hoadononline;
import java.time.LocalDateTime;
import java.util.*;

import com.example.dreambackend.dtos.HoaDonChiTietDto;
import com.example.dreambackend.dtos.HoaDonDto;
import com.example.dreambackend.dtos.VoucherDto;
import com.example.dreambackend.entities.*;
import com.example.dreambackend.repositories.*;
import com.example.dreambackend.responses.GioHangChiTietResponse;
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

    @Override
    public List<Integer> getGioHangIdsForThanhToan(Integer idKhachHang) {
        //xóa giỏ hàng với trạng thái là 2
        gioHangChiTietRepository.deleteByKhachHangIdAndTrangThai(idKhachHang, 2);

        // Lấy danh sách giỏ hàng của khách hàng
        List<GioHangChiTietResponse> gioHangChiTietList = gioHangChiTietRepository.findGioHangChiTietByKhachHangId(idKhachHang);

        if (gioHangChiTietList.isEmpty()) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Không có sản phẩm nào trong giỏ hàng.");
        }

        List<Integer> gioHangIds = new ArrayList<>();

        for (GioHangChiTietResponse gioHang : gioHangChiTietList) {
            GioHangChiTiet gioHangChiTiet = gioHangChiTietRepository.findById(gioHang.getId())
                    .orElseThrow(() -> new RuntimeException("Giỏ hàng chi tiết không tồn tại"));

            gioHangChiTiet.setTrangThai(0);
            gioHangChiTietRepository.save(gioHangChiTiet);
            gioHangIds.add(gioHangChiTiet.getId());
        }

        return gioHangIds;

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
    public HoaDon createHoaDon(Integer idKhachHang, Integer voucherId, Double tongTienTruocGiam, Integer paymentMethodId, Double TongTienSauGiam, String sdtNguoiNhan, String tenNguoiNhan, String diaChi, Double shippingFee) {
        // Lấy khách hàng từ repository
        KhachHang khachHang = khachHangRepository.findById(idKhachHang).orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Khách hàng không tồn tại"));
        // Lấy phương thức thanh toán từ repository
        PhuongThucThanhToan phuongThucThanhToan = phuongThucThanhToanRepository.findById(paymentMethodId).orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Phương thức thanh toán không tồn tại"));
        Voucher voucher = null;

        if (voucherId != null) {
            voucher = voucherRepository.findById(voucherId)
                    .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Voucher không tồn tại"));
        }


        // Bước 1: Tạo Hóa Đơn (HoaDon)
        HoaDon hoaDon = new HoaDon();
        hoaDon.setKhachHang(khachHang);
        hoaDon.setMa("HD" + (System.currentTimeMillis() % 10000000)); // Sinh mã hóa đơn (có thể thay đổi theo logic của bạn)
        hoaDon.setNgayTao(LocalDate.now());
        hoaDon.setVoucher(voucher);
        // Nếu id phương thức thanh toán là 4, thì trạng thái hóa đơn là 2
        if (paymentMethodId == 4) {
            hoaDon.setTrangThai(2); // Trạng thái hóa đơn là 2

            // Trừ số lượng của voucher nếu có
            if (voucher != null) {
                int soLuongConLai = voucher.getSoLuong() - 1;
                if (soLuongConLai < 0) {
                    throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Voucher đã hết lượt sử dụng");
                }
                voucher.setSoLuong(soLuongConLai);
                voucherRepository.save(voucher);
            }

        } else {
            hoaDon.setTrangThai(1); // Đánh dấu hóa đơn là hoạt động
        }

        hoaDon.setPhuongThucThanhToan(phuongThucThanhToan); // Gán phương thức thanh toán cho hóa đơn

        // Lưu hóa đơn vào repository
        hoaDonRepository.save(hoaDon);
        HoaDon hoaDon1 = hoaDonRepository.findById(hoaDon.getId()).orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Khách hàng không tồn tại"));
        // Bước 2: Thêm Sản Phẩm vào Hóa Đơn Chi Tiết (HoaDonChiTiet)
        List<GioHangChiTietResponse> gioHangChiTietResponses = gioHangChiTietRepository.findGioHangChiTietByStatus(idKhachHang);

        for (GioHangChiTietResponse item : gioHangChiTietResponses) {
            if (item.getTrangThai() == 0 || item.getTrangThai() == 2) {
                SanPhamChiTiet sanPhamChiTiet = sanPhamChiTietRepository.findById(item.getIdSanPhamChiTiet())
                        .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Sản phẩm chi tiết không tồn tại"));

                // Trừ số lượng sản phẩm chi tiết nếu phương thức thanh toán là 4
                if (paymentMethodId == 4) {
                    int soLuongConLai = sanPhamChiTiet.getSoLuong() - item.getSoLuong();
                    if (soLuongConLai < 0) {
                        throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Sản phẩm không đủ số lượng tồn");
                    }
                    sanPhamChiTiet.setSoLuong(soLuongConLai);
                    sanPhamChiTietRepository.save(sanPhamChiTiet);
                }

                HoaDonChiTiet hoaDonChiTiet = new HoaDonChiTiet();
                hoaDonChiTiet.setMa("HDCT" + System.currentTimeMillis());
                hoaDonChiTiet.setHoaDon(hoaDon1);
                hoaDonChiTiet.setSanPhamChiTiet(sanPhamChiTiet);
                hoaDonChiTiet.setSoLuong(item.getSoLuong());
                hoaDonChiTiet.setDonGia(item.getDonGia());
                hoaDonChiTietRepository.save(hoaDonChiTiet);
            }
        }

        // Bước 3: Cập nhật tổng tiền cho hóa đơn
        hoaDon.setTongTienTruocVoucher(tongTienTruocGiam);
        hoaDon.setTongTienThanhToan(TongTienSauGiam);
        hoaDon.setTenNguoiNhan(tenNguoiNhan);
        hoaDon.setSdtNguoiNhan(sdtNguoiNhan);
        hoaDon.setDiaChiNhanHang(diaChi);
        hoaDon.setPhiVanChuyen(shippingFee);
        hoaDonRepository.save(hoaDon);
        gioHangChiTietRepository.deleteByTrangThaiIn(List.of(0, 2));
        return hoaDon; // Trả về hóa đơn đã tạo với thông tin chi tiết
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
        hoaDon.setTrangThai(5);
        hoaDon.setGhiChu(ghiChu);
        hoaDonRepository.save(hoaDon);
        return hoaDon;
    }

    @Override
    public HoaDon tangTrangThaiHoaDon(Integer id) {
        Optional<HoaDon> optionalHoaDon = hoaDonRepository.findById(id);

        if (optionalHoaDon.isPresent()) {
            HoaDon hoaDon = optionalHoaDon.get();
            Integer trangThaiHienTai = hoaDon.getTrangThai();

            // Nếu trạng thái chưa là 4, tăng trạng thái và ghi lại ngày sửa
            if (trangThaiHienTai != null && trangThaiHienTai < 4) {
                hoaDon.setTrangThai(trangThaiHienTai + 1); // Tăng trạng thái (ví dụ: từ 1->2, từ 2->3...)

                // Nếu trạng thái là 2, trừ số lượng sản phẩm và giảm số lượng voucher
                if (trangThaiHienTai == 1) {
                    // Lấy danh sách chi tiết hóa đơn từ HoaDonChiTietRepository
                    List<HoaDonChiTiet> hoaDonChiTietList = hoaDonChiTietRepository.findByHoaDonId(hoaDon.getId());

                    // Giảm số lượng sản phẩm trong chi tiết hóa đơn
                    for (HoaDonChiTiet hct : hoaDonChiTietList) {
                        SanPhamChiTiet spct = hct.getSanPhamChiTiet();
                        // Giảm số lượng sản phẩm theo số lượng của chi tiết hóa đơn
                        if (spct != null) {
                            spct.setSoLuong(spct.getSoLuong() - hct.getSoLuong());
                            sanPhamChiTietRepository.save(spct); // Lưu lại sự thay đổi trong kho
                        }
                    }

                    // Nếu có voucher, giảm số lượng voucher
                    if (hoaDon.getVoucher() != null) {
                        Voucher voucher = hoaDon.getVoucher();
                        voucher.setSoLuong(voucher.getSoLuong() - 1); // Giảm 1 voucher đã sử dụng
                        voucherRepository.save(voucher); // Lưu lại sự thay đổi của voucher
                    }
                }

                //  Nếu trạng thái đã là 4 → vẫn cập nhật ngày sửa
                if (trangThaiHienTai != null && trangThaiHienTai == 3) {
                    hoaDon.setNgaySua(LocalDate.now()); // Cập nhật ngày sửa tại trạng thái cuối
                }
                // Lưu lại hóa đơn đã cập nhật
                return hoaDonRepository.save(hoaDon);
            }

            // Nếu trạng thái đã là 4 thì trả lại hóa đơn không thay đổi
            return hoaDon;
        }

        return null; // Không tìm thấy hóa đơn
    }


}


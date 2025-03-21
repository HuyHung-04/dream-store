package com.example.dreambackend.services.hoadononline;
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
            // Thêm vào danh sách ID giỏ hàng đã cập nhật
            gioHangIds.add(gioHangChiTiet.getId());
        }

        return gioHangIds;

    }

    @Override
    public List<GioHangChiTietResponse> getChiTietGioHangSauThanhToan(Integer idKhachHang) {
        return gioHangChiTietRepository.findGioHangChiTietByStatus(idKhachHang);
    }

    @Override
    public Double calculateTotalPrice(Integer idKhachHang) {
        // Lấy danh sách giỏ hàng chi tiết theo trạng thái và khách hàng
        List<GioHangChiTietResponse> gioHangChiTietResponses = gioHangChiTietRepository.findGioHangChiTietByStatus(idKhachHang);

        Double totalPrice = 0.0;

        // Duyệt qua danh sách và tính tổng tiền nếu trạng thái giỏ hàng là 0 hoặc 2
        for (GioHangChiTietResponse item : gioHangChiTietResponses) {
            if (item.getTrangThai() == 0 || item.getTrangThai() == 2) {
                totalPrice += item.getDonGia() * item.getSoLuong(); // Tính tổng theo số lượng và đơn giá
            }
        }

        return totalPrice;
    }


    @Override
    public List<VoucherDto> getVoucherIdAndTen(Integer idKhachHang) {
        // Lấy tổng giá trị giỏ hàng của khách hàng
        Double totalPrice = calculateTotalPrice(idKhachHang);

        // Lấy tất cả voucher từ database
        List<VoucherDto> allVouchers = voucherRepository.findIdAndTen();

        // Lọc danh sách voucher dựa trên đơn tối thiểu
        return allVouchers.stream()
                .filter(v -> {
                    Voucher voucher = voucherRepository.findById(v.getId()).orElse(null);
                    return voucher != null && totalPrice >= voucher.getDonToiThieu().doubleValue();
                })
                .collect(Collectors.toList());
    }

    // Phương thức tính tổng tiền sau khi áp dụng voucher
    @Override
    public Double calculateTotalPriceWithVoucher(Integer idKhachHang, Integer voucherId, Double shippingFee) {
        // Lấy chi tiết giỏ hàng của khách hàng
        List<GioHangChiTietResponse> gioHangChiTietResponses = gioHangChiTietRepository.findGioHangChiTietByStatus(idKhachHang);

        // Tính tổng tiền giỏ hàng
        Double totalPrice = 0.0;
        for (GioHangChiTietResponse item : gioHangChiTietResponses) {
            totalPrice += item.getDonGia() * item.getSoLuong();
        }

        Double discountAmount = 0.0;

        // Nếu có voucherId thì mới xử lý giảm giá
        if (voucherId != null) {
            Voucher voucher = voucherRepository.findById(voucherId)
                    .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Voucher không tồn tại"));

            if (voucher.isHinhThucGiam()) {
                // Giảm theo số tiền cố định
                discountAmount = voucher.getGiaTriGiam().doubleValue();
            } else {
                // Giảm theo phần trăm
                discountAmount = totalPrice * voucher.getGiaTriGiam().doubleValue() / 100;
            }

            // Giảm tối đa
            if (voucher.getGiamToiDa() != null && discountAmount > voucher.getGiamToiDa().doubleValue()) {
                discountAmount = voucher.getGiamToiDa().doubleValue();
            }
        }

        // Tổng tiền sau giảm = tổng - giảm + ship
        Double totalPriceAfterDiscount = (totalPrice - discountAmount) + shippingFee;

        return totalPriceAfterDiscount;
    }


    @Override
    public HoaDon createHoaDonAndAddProducts(Integer idKhachHang, Integer voucherId, Double tongTienTruocGiam, Integer paymentMethodId, Double TongTienSauGiam, String sdtNguoiNhan, String tenNguoiNhan, String diaChi, Double shippingFee) {
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
        hoaDon.setMa("HD" + System.currentTimeMillis()); // Sinh mã hóa đơn (có thể thay đổi theo logic của bạn)
        hoaDon.setNgayTao(LocalDate.now());
        hoaDon.setNgaySua(LocalDate.now());
        hoaDon.setVoucher(voucher);
        hoaDon.setTrangThai(1); // Đánh dấu hóa đơn là hoạt động
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

                // Kiểm tra và áp dụng khuyến mãi (nếu có)
                Double donGiaSauGiam = item.getDonGia(); // Bắt đầu với giá gốc của sản phẩm

                if (voucherId != null) {
                    // Lấy voucher từ repository

                    if (voucher != null && item.getDonGia() >= voucher.getDonToiThieu().doubleValue()) {
                        if (voucher.isHinhThucGiam()) {
                            // Giảm theo tỷ lệ phần trăm
                            donGiaSauGiam = item.getDonGia() * (1 - voucher.getGiaTriGiam().doubleValue() / 100);
                        }
                    }
                }

                HoaDonChiTiet hoaDonChiTiet = new HoaDonChiTiet();
                hoaDonChiTiet.setMa("HDCT" + System.currentTimeMillis());
                hoaDonChiTiet.setHoaDon(hoaDon1);
                hoaDonChiTiet.setSanPhamChiTiet(sanPhamChiTiet);
                hoaDonChiTiet.setSoLuong(item.getSoLuong());
                hoaDonChiTiet.setDonGia(donGiaSauGiam); // Giá ban đầu trước khi giảm giá
                hoaDonChiTietRepository.save(hoaDonChiTiet);

//                // ✅ Trừ số lượng tồn kho của sản phẩm chi tiết
//                int soLuongHienTai = sanPhamChiTiet.getSoLuong();
//                int soLuongMua = item.getSoLuong();
//
//                if (soLuongHienTai < soLuongMua) {
//                    throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Số lượng sản phẩm không đủ trong kho");
//                }
//
//                sanPhamChiTiet.setSoLuong(soLuongHienTai - soLuongMua);
//                sanPhamChiTietRepository.save(sanPhamChiTiet);
            }
        }

        // Bước 3: Cập nhật tổng tiền cho hóa đơn
        hoaDon.setTongTienTruocVoucher(tongTienTruocGiam);
        hoaDon.setTongTienThanhToan(TongTienSauGiam); // Cộng thêm phí vận chuyển
        hoaDon.setTenNguoiNhan(tenNguoiNhan);
        hoaDon.setSdtNguoiNhan(sdtNguoiNhan);
        hoaDon.setDiaChiNhanHang(diaChi);
        hoaDon.setPhiVanChuyen(shippingFee);
        hoaDonRepository.save(hoaDon); // Lưu hóa đơn với tổng tiền đã tính toán
        gioHangChiTietRepository.deleteByTrangThaiIn(List.of(0, 2));
        return hoaDon; // Trả về hóa đơn đã tạo với thông tin chi tiết
    }


    public List<HoaDonChiTietDto> getChiTietHoaDonByMa(String maHoaDon) {
        // Lấy dữ liệu từ repository
        List<Object[]> results = hoaDonChiTietRepository.findChiTietByMaHoaDon(maHoaDon);

        // Kiểm tra nếu không có dữ liệu
        if (results.isEmpty()) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Không tìm thấy hóa đơn chi tiết với mã: " + maHoaDon);
        }

        // Xử lý dữ liệu và map vào DTO
        List<HoaDonChiTietDto> chiTietDtos = new ArrayList<>();
        for (Object[] row : results) {
            // Kiểm tra kiểu dữ liệu và ép kiểu chính xác
            String maSanPham = (String) row[0];
            String tenSanPham = (String) row[1];
            // Kiểm tra giá trị có null không trước khi ép kiểu
            Integer soLuong = row[3] != null ? ((Number) row[3]).intValue() : 0;
            String mauSac = (String) row[4];
            String size = (String) row[5];
            String anhUrl = (String) row[6];
            // Kiểm tra nếu giá trị không null trước khi ép kiểu cho giá trị số
            Double donGia = row[2] != null ? ((Number) row[2]).doubleValue() : 0.0;
            // Nếu ảnh tồn tại, thêm vào list, nếu không thì trả về list rỗng
            List<String> anhUrls = anhUrl != null ? List.of(anhUrl) : List.of();

            // Thêm vào danh sách DTO
            HoaDonChiTietDto hoaDonChiTietDto = new HoaDonChiTietDto(
                    maSanPham, tenSanPham, donGia, soLuong, mauSac, size, anhUrls
            );
            chiTietDtos.add(hoaDonChiTietDto);
        }

        return chiTietDtos;
    }


    public List<HoaDonDto> getHoaDonChiTietDto() {
        List<Object[]> result = hoaDonChiTietRepository.getHoaDonChiTiet();
        List<HoaDonDto> hoaDonDtos = new ArrayList<>();


        for (Object[] row : result) {


            HoaDonDto hoaDonDto = new HoaDonDto();
            hoaDonDto.setIdHoaDon((Integer) row[0]);
            hoaDonDto.setMaHoaDon((String) row[1]);
            hoaDonDto.setTongTienThanhToan(row[2] != null ? (Double) row[2] : 0.0);
            hoaDonDto.setIdHoaDonChiTiet((Integer) row[3]);
            hoaDonDto.setMaSanPham((String) row[4]);
            hoaDonDto.setTenSanPham((String) row[5]);
            hoaDonDto.setSoLuong(row[6] != null ? (Integer) row[6] : 0);  // Kiểm tra nếu có dữ liệu
            hoaDonDto.setMauSac((String) row[7]);
            hoaDonDto.setSize((String) row[9]);
            hoaDonDto.setAnhUrl((String) row[10]);  // Kiểm tra nếu có ảnh
            hoaDonDto.setDonGia(row[8] != null ? (Double) row[8] : 0.0);
            hoaDonDtos.add(hoaDonDto);

        }
        return hoaDonDtos;
    }
    // Lấy hóa đơn với voucher, khách hàng và phương thức thanh toán
    public Optional<HoaDon> getHoaDonWithDetailsByMa(String ma) {
        return hoaDonRepository.findHoaDonWithDetailsByMa(ma);
    }

}


package com.example.dreambackend.services.hoadononline;

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
import java.util.ArrayList;
import java.util.List;
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
    @Override
    // Phương thức tính tổng tiền sau khi áp dụng voucher
    public Double calculateTotalPriceWithVoucher(Integer idKhachHang, Integer voucherId,Double shippingFee) {
        // Lấy chi tiết giỏ hàng của khách hàng
        List<GioHangChiTietResponse> gioHangChiTietResponses = gioHangChiTietRepository.findGioHangChiTietByStatus(idKhachHang);

        // Tính tổng tiền giỏ hàng
        Double totalPrice = 0.0;
        for (GioHangChiTietResponse item : gioHangChiTietResponses) {
            totalPrice += item.getDonGia()* item.getSoLuong(); // Giả sử bạn tính tổng với `donGiaSauGiam`
        }

        // Lấy voucher từ database
        Voucher voucher = voucherRepository.findById(voucherId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Voucher không tồn tại"));

        // Tính giảm giá theo hình thức của voucher
        Double discountAmount;
        if (voucher.isHinhThucGiam()) {
            // Giảm theo tỷ lệ phần trăm
            discountAmount = totalPrice * voucher.getGiaTriGiam().doubleValue() / 100;
        } else {
            // Giảm theo giá trị cố định
            discountAmount = voucher.getGiaTriGiam().doubleValue();
        }

        // Đảm bảo giảm giá không vượt quá mức tối đa của voucher
        if (voucher.getGiamToiDa() != null && discountAmount > voucher.getGiamToiDa().doubleValue()) {
            discountAmount = voucher.getGiamToiDa().doubleValue();
        }


        // Tính tổng tiền sau giảm giá
        Double totalPriceAfterDiscount = (totalPrice - discountAmount) + shippingFee;

        return totalPriceAfterDiscount;
    }

    @Override
    public HoaDon createHoaDonAndAddProducts(Integer idKhachHang, Integer voucherId,Double tongTienTruocGiam, Integer paymentMethodId,Double TongTienSauGiam,String sdtNguoiNhan,String tenNguoiNhan,String diaChi,Double shippingFee    ) {
        // Lấy khách hàng từ repository
        KhachHang khachHang = khachHangRepository.findById(idKhachHang).orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Khách hàng không tồn tại"));
        // Lấy phương thức thanh toán từ repository
        PhuongThucThanhToan phuongThucThanhToan = phuongThucThanhToanRepository.findById(paymentMethodId).orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Phương thức thanh toán không tồn tại"));
        Voucher voucher = voucherRepository.findById(voucherId).orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Phương thức thanh toán không tồn tại"));

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
        HoaDon hoaDon1 =hoaDonRepository.findById(hoaDon.getId()).orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Khách hàng không tồn tại"));
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
                        } else {
                            // Giảm theo giá trị cố định
                            donGiaSauGiam = item.getDonGia() - voucher.getGiaTriGiam().doubleValue();
                        }
                    }
                }

                HoaDonChiTiet hoaDonChiTiet = new HoaDonChiTiet();
                hoaDonChiTiet.setHoaDon(hoaDon1);
                hoaDonChiTiet.setSanPhamChiTiet(sanPhamChiTiet);
                hoaDonChiTiet.setSoLuong(item.getSoLuong());
                hoaDonChiTiet.setDonGia(donGiaSauGiam); // Giá ban đầu trước khi giảm giá
                hoaDonChiTietRepository.save(hoaDonChiTiet);

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



}

package com.example.dreambackend.services.hoadononline;

import com.example.dreambackend.dtos.VoucherDto;
import com.example.dreambackend.entities.GioHangChiTiet;
import com.example.dreambackend.entities.HoaDon;
import com.example.dreambackend.entities.HoaDonChiTiet;
import com.example.dreambackend.entities.Voucher;
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


@Override
    public List<Integer> getGioHangIdsForThanhToan(Integer idKhachHang) {
    // Lấy danh sách giỏ hàng của khách hàng
    List<GioHangChiTietResponse> gioHangChiTietList = gioHangChiTietRepository.findGioHangChiTietByKhachHangId(idKhachHang);

    if (gioHangChiTietList.isEmpty()) {
        throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Không có sản phẩm nào trong giỏ hàng.");
    }

    List<Integer> gioHangIds = new ArrayList<>();

    for (GioHangChiTietResponse gioHang : gioHangChiTietList) {
            GioHangChiTiet gioHangChiTiet = gioHangChiTietRepository.findById(gioHang.getId())
                    .orElseThrow(() -> new RuntimeException("Giỏ hàng chi tiết không tồn tại"));

        Double donGiaGoc = gioHangChiTiet.getDonGia(); // Giá gốc của sản phẩm
        Double donGiaSauGiam = donGiaGoc*(gioHangChiTiet.getSoLuong()); // Giá sau khi giảm
        gioHangChiTiet.setTrangThai(0);
        gioHangChiTiet.setDonGia(donGiaSauGiam);
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
        List<GioHangChiTietResponse> gioHangChiTietResponses = gioHangChiTietRepository.findGioHangChiTietByStatus(idKhachHang);

        Double totalPrice = 0.0;
        for (GioHangChiTietResponse item : gioHangChiTietResponses) {
            totalPrice += item.getDonGia(); // Giả sử bạn tính tổng với `donGiaSauGiam`
        }

        return totalPrice;
    }


    public List<VoucherDto> getVoucherIdAndTen() {
        return voucherRepository.findIdAndTen();
    }

    @Override
    // Phương thức tính tổng tiền sau khi áp dụng voucher
    public Double calculateTotalPriceWithVoucher(Integer idKhachHang, Integer voucherId) {
        // Lấy chi tiết giỏ hàng của khách hàng
        List<GioHangChiTietResponse> gioHangChiTietResponses = gioHangChiTietRepository.findGioHangChiTietByStatus(idKhachHang);

        // Tính tổng tiền giỏ hàng
        Double totalPrice = 0.0;
        for (GioHangChiTietResponse item : gioHangChiTietResponses) {
            totalPrice += item.getDonGia(); // Giả sử bạn tính tổng với `donGiaSauGiam`
        }

        // Lấy voucher từ database
        Voucher voucher = voucherRepository.findById(voucherId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Voucher không tồn tại"));

        // Tính giảm giá theo hình thức của voucher
        Double discountAmount = 0.0;
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

        // Đảm bảo giảm giá không thấp hơn mức tối thiểu
        if (voucher.getDonToiThieu() != null && discountAmount < voucher.getDonToiThieu().doubleValue()) {
            discountAmount = voucher.getDonToiThieu().doubleValue();
        }

        // Tính tổng tiền sau giảm giá
        Double totalPriceAfterDiscount = totalPrice - discountAmount;

        return totalPriceAfterDiscount;
    }
}

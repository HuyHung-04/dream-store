package com.example.dreambackend.services.thongke;

import com.example.dreambackend.repositories.HoaDonChiTietRepository;
import com.example.dreambackend.repositories.HoaDonRepository;
import com.example.dreambackend.responses.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

import java.time.DayOfWeek;
import java.time.LocalDate;
import java.time.YearMonth;
import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class ThongKeService {

    @Autowired
    private HoaDonRepository hoaDonRepository;
    @Autowired
    private HoaDonChiTietRepository hoaDonChiTietRepository;

    public ThongKeResponse thongKeTongQuan(String type) {
        LocalDate startDate = null;
        LocalDate endDate = null;

        switch (type) {
            case "Hôm nay":
                startDate = LocalDate.now();
                endDate = LocalDate.now();
                break;
            case "Tất cả":
                // Không thiết lập startDate và endDate
                break;
            default:
                throw new IllegalArgumentException("Invalid type: " + type);
        }

        return hoaDonRepository.getTongQuan(startDate, endDate);
    }

    // Phương thức để lấy tổng quan theo tháng và năm
    public ThongKeResponse getTongQuanTheoThangVaNam(int month, int year) {
        ThongKeResponse response = hoaDonRepository.getTongQuanTheoThangVaNam(month, year);
        if (response == null) {
            return new ThongKeResponse(0, 0, 0);
        }
        return response;
    }

    public List<ThongKeThangResponse> thongKeTungThang(int year) {
        return hoaDonRepository.getDoanhThuTungThangTheoNam(year);
    }

    public List<ThongKeThangResponse> thongKeTungNam() {
        List<Object[]> results = hoaDonRepository.getDoanhThuTungNam();
        return results.stream()
                .filter(obj -> obj[0] != null && obj[1] != null) // lọc bỏ các dòng có dữ liệu null
                .map(obj -> new ThongKeThangResponse((Integer) obj[0], (Double) obj[1]))
                .collect(Collectors.toList());
    }
    // Thống kê doanh thu từng ngày trong tháng
    public List<ThongKeThangNayResponse> thongKeTungNgayTrongThang(int month, int year) {
        return hoaDonRepository.getDoanhThuTheoNgayTheoThang(month, year);
    }

    // Thống kê doanh thu ngày hôm nay
    public ThongKeHomNayResponse thongKeHomNay() {
        return hoaDonRepository.getDoanhThuHomNay();
    }
    // Thống kê sản phẩm bán chạy nhất trong ngày hôm nay
    public List<TopSanPhamResponse> topSanPhamHomNay() {
        return hoaDonChiTietRepository.getTopSanPhamHomNay(PageRequest.of(0, 5)).getContent();
    }

    public List<TopSanPhamResponse> topSanPhamTheoThangVaNam(int thang, int nam) {
        // Xác định ngày bắt đầu và kết thúc của tháng
        LocalDate startDate = LocalDate.of(nam, thang, 1);
        LocalDate endDate = startDate.withDayOfMonth(startDate.lengthOfMonth());

        Page<TopSanPhamResponse> pageResult = hoaDonChiTietRepository
                .getTopSanPhamTheoThangVaNam(PageRequest.of(0, 5), startDate, endDate);

        // Trả về danh sách sản phẩm (dù ít hơn 5 vẫn trả về đầy đủ)
        return pageResult != null ? pageResult.getContent() : new ArrayList<>();
    }



    public List<TopSanPhamResponse> topSanPhamTheoNam(int nam) {
        LocalDate startDate = LocalDate.of(nam, 1, 1);
        LocalDate endDate = LocalDate.of(nam, 12, 31);

        Pageable pageable = PageRequest.of(0, 5);
        Page<TopSanPhamResponse> topSanPhamPage = hoaDonChiTietRepository.getTopSanPhamTheoNam(pageable, startDate, endDate);

        // Kiểm tra xem có ít hơn 5 sản phẩm không và trả về tất cả nếu ít hơn 5
        if (topSanPhamPage.getTotalElements() < 5) {
            return topSanPhamPage.getContent(); // Trả về tất cả sản phẩm có trong năm
        }

        // Nếu có đủ 5 sản phẩm, trả về top 5
        return topSanPhamPage.getContent();
    }


    // Thống kê sản phẩm bán chạy nhất tất cả thời gian
    public List<TopSanPhamResponse> topSanPhamTatCa() {
        return hoaDonChiTietRepository.getTopSanPhamTatCa(PageRequest.of(0, 5)).getContent();
    }
}

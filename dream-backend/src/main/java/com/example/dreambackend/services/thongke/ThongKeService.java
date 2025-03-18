package com.example.dreambackend.services.thongke;

import com.example.dreambackend.repositories.HoaDonChiTietRepository;
import com.example.dreambackend.repositories.HoaDonRepository;
import com.example.dreambackend.responses.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;

import java.time.DayOfWeek;
import java.time.LocalDate;
import java.time.YearMonth;
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
            case "Tháng này":
                YearMonth currentMonth = YearMonth.now();
                startDate = currentMonth.atDay(1);  // Ngày đầu tháng
                endDate = currentMonth.atEndOfMonth();  // Ngày cuối tháng
                break;
            case "Năm nay":
                int currentYear = LocalDate.now().getYear();
                startDate = LocalDate.of(currentYear, 1, 1);
                endDate = LocalDate.of(currentYear, 12, 31);
                break;
            case "Tất cả":
                // Không thiết lập startDate và endDate
                break;
            default:
                throw new IllegalArgumentException("Invalid type: " + type);
        }

        return hoaDonRepository.getTongQuan(startDate, endDate);
    }

    public List<ThongKeThangResponse> thongKeTungThang() {
        return hoaDonRepository.getDoanhThuTungThang();
    }
    public List<ThongKeThangResponse> thongKeTungNam() {
        List<Object[]> results = hoaDonRepository.getDoanhThuTungNam();
        return results.stream()
                .map(obj -> new ThongKeThangResponse((Integer) obj[0], (Double) obj[1]))
                .collect(Collectors.toList());
    }
    // Thống kê doanh thu từng ngày trong tháng
    public List<ThongKeThangNayResponse> thongKeTungNgayTrongThang() {
        return hoaDonRepository.getDoanhThuTungNgayTrongThang();
    }
    // Thống kê doanh thu ngày hôm nay
    public ThongKeHomNayResponse thongKeHomNay() {
        return hoaDonRepository.getDoanhThuHomNay();
    }
    // Thống kê sản phẩm bán chạy nhất trong ngày hôm nay
    public List<TopSanPhamResponse> topSanPhamHomNay() {
        return hoaDonChiTietRepository.getTopSanPhamHomNay(PageRequest.of(0, 5)).getContent();
    }

    // Thống kê sản phẩm bán chạy nhất trong tháng này
    public List<TopSanPhamResponse> topSanPhamThangNay() {
        LocalDate startDate = LocalDate.now().withDayOfMonth(1); // Ngày đầu tháng
        LocalDate endDate = LocalDate.now().withDayOfMonth(LocalDate.now().lengthOfMonth()); // Ngày cuối tháng
        return hoaDonChiTietRepository.getTopSanPhamThangNay(PageRequest.of(0, 5), startDate, endDate).getContent();
    }

    // Thống kê sản phẩm bán chạy nhất trong năm nay
    public List<TopSanPhamResponse> topSanPhamNamNay() {
        return hoaDonChiTietRepository.getTopSanPhamNamNay(PageRequest.of(0, 5)).getContent();
    }

    // Thống kê sản phẩm bán chạy nhất tất cả thời gian
    public List<TopSanPhamResponse> topSanPhamTatCa() {
        return hoaDonChiTietRepository.getTopSanPhamTatCa(PageRequest.of(0, 5)).getContent();
    }
}

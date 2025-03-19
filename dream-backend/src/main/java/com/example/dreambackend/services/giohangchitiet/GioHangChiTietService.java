package com.example.dreambackend.services.giohangchitiet;

import com.example.dreambackend.entities.*;
import com.example.dreambackend.repositories.*;
import com.example.dreambackend.requests.GioHangChiTietRequest;
import com.example.dreambackend.responses.GioHangChiTietResponse;
import jakarta.transaction.Transactional;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

@Service
public class GioHangChiTietService implements IGioHangChiTietService {
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

    public List<GioHangChiTietResponse> getGioHangChiTietByKhachHangId(Integer idKhachHang) {
        return gioHangChiTietRepository.findGioHangChiTietByKhachHangId(idKhachHang);
    }

    @Override
    @Transactional
    public GioHangChiTietResponse themSanPhamVaoGio(GioHangChiTietRequest request) {
        Optional<GioHangChiTiet> existingItem = gioHangChiTietRepository.findByKhachHangIdAndSanPhamChiTietIdAndTrangThai(
                request.getIdKhachHang(), request.getIdSanPhamChiTiet()
        );

        GioHangChiTiet gioHangChiTiet;

        if (existingItem.isPresent()) {
            gioHangChiTiet = existingItem.get();
            gioHangChiTiet.setSoLuong(gioHangChiTiet.getSoLuong() + request.getSoLuong());
            gioHangChiTiet.setNgaySua(LocalDate.now());
            Double ThanhTien = gioHangChiTiet.getSanPhamChiTiet().getGia() * gioHangChiTiet.getSoLuong();
            gioHangChiTiet.setDonGia(ThanhTien / gioHangChiTiet.getSoLuong());
        } else {
            gioHangChiTiet = new GioHangChiTiet();
            gioHangChiTiet.setKhachHang(khachHangRepository.findById(request.getIdKhachHang()).orElseThrow());
            gioHangChiTiet.setSanPhamChiTiet(sanPhamChiTietRepository.findById(request.getIdSanPhamChiTiet()).orElseThrow());
            gioHangChiTiet.setSoLuong(request.getSoLuong());
            gioHangChiTiet.setTrangThai(1);
            gioHangChiTiet.setDonGia(gioHangChiTiet.getSanPhamChiTiet().getGia() / gioHangChiTiet.getSoLuong());
            gioHangChiTiet.setNgayTao(LocalDate.now());
            gioHangChiTiet.setNgaySua(LocalDate.now());
        }

        gioHangChiTiet = gioHangChiTietRepository.save(gioHangChiTiet);

        // Lấy ảnh sản phẩm đầu tiên
        String anhUrl = anhRepository.findFirstBySanPhamIdAndTrangThaiOrderByNgayTaoAsc(
                        gioHangChiTiet.getSanPhamChiTiet().getSanPham().getId(), 1)
                .map(Anh::getAnhUrl)
                .orElse(null);

        // Lấy giá trị giảm theo % (bỏ hinhThucGiam)
        Double giaTriGiam = (gioHangChiTiet.getSanPhamChiTiet().getKhuyenMai() != null) ?
                gioHangChiTiet.getSanPhamChiTiet().getKhuyenMai().getGiaTriGiam() : 0.0;

        // Trả về thông tin giỏ hàng sau khi cập nhật
        return new GioHangChiTietResponse(
                gioHangChiTiet.getId(),
                anhUrl,
                gioHangChiTiet.getSanPhamChiTiet().getSanPham().getTen(),
                gioHangChiTiet.getSanPhamChiTiet().getMauSac().getTen(),
                gioHangChiTiet.getSanPhamChiTiet().getSize().getTen(),
                gioHangChiTiet.getSoLuong(),
                gioHangChiTiet.getDonGia(),
                giaTriGiam, // Chỉ giảm theo %
                gioHangChiTiet.getTrangThai(),
                gioHangChiTiet.getKhachHang().getId(),
                gioHangChiTiet.getSanPhamChiTiet().getId()
        );
    }



    @Override
    @Transactional
    public GioHangChiTietResponse muaNgay(GioHangChiTietRequest request) {
        // Cập nhật tất cả giỏ hàng có `trangThai = 0` thành `1`
        int updatedRows = gioHangChiTietRepository.updateAllTrangThaiFrom0To1(request.getIdKhachHang());
        System.out.println("Đã cập nhật " + updatedRows + " sản phẩm từ trạng thái 0 → 1.");

        // Xóa tất cả giỏ hàng có trạng thái 2 trước khi tạo mới
        int deletedRows = gioHangChiTietRepository.deleteByKhachHangIdAndTrangThai2(request.getIdKhachHang());
        System.out.println("Đã xóa " + deletedRows + " sản phẩm có trạng thái 2.");

        // Tạo giỏ hàng mới với trạng thái 2
        GioHangChiTiet gioHangMoi = new GioHangChiTiet();
        gioHangMoi.setKhachHang(khachHangRepository.findById(request.getIdKhachHang()).orElseThrow());
        gioHangMoi.setSanPhamChiTiet(sanPhamChiTietRepository.findById(request.getIdSanPhamChiTiet()).orElseThrow());
        gioHangMoi.setSoLuong(request.getSoLuong());
        gioHangMoi.setTrangThai(2);
        gioHangMoi.setDonGia(gioHangMoi.getSanPhamChiTiet().getGia() * gioHangMoi.getSoLuong());
        gioHangMoi.setNgayTao(LocalDate.now());
        gioHangMoi.setNgaySua(LocalDate.now());
        gioHangMoi = gioHangChiTietRepository.save(gioHangMoi);

        // Lấy ảnh sản phẩm đầu tiên
        String anhUrl = anhRepository.findFirstBySanPhamIdAndTrangThaiOrderByNgayTaoAsc(
                        gioHangMoi.getSanPhamChiTiet().getSanPham().getId(), 1)
                .map(Anh::getAnhUrl)
                .orElse(null);

        // Chỉ lấy giá trị giảm (mặc định là giảm theo %)
        Double giaTriGiam = (gioHangMoi.getSanPhamChiTiet().getKhuyenMai() != null) ?
                gioHangMoi.getSanPhamChiTiet().getKhuyenMai().getGiaTriGiam() : 0.0;

        // Trả về thông tin giỏ hàng sau khi cập nhật
        return new GioHangChiTietResponse(
                gioHangMoi.getId(),
                anhUrl,
                gioHangMoi.getSanPhamChiTiet().getSanPham().getTen(),
                gioHangMoi.getSanPhamChiTiet().getMauSac().getTen(),
                gioHangMoi.getSanPhamChiTiet().getSize().getTen(),
                gioHangMoi.getSoLuong(),
                gioHangMoi.getDonGia(),
                giaTriGiam, // Chỉ giảm theo %
                gioHangMoi.getTrangThai(),
                gioHangMoi.getKhachHang().getId(),
                gioHangMoi.getSanPhamChiTiet().getId()
        );
    }


    @Override
    public void xoaSanPhamKhoiGio(Integer idGioHangChiTiet) {
        gioHangChiTietRepository.deleteById(idGioHangChiTiet);
    }

    @Override
    public GioHangChiTietResponse suaSoLuongSanPham(Integer idGioHangChiTiet, Integer soLuongMoi) {
        GioHangChiTiet gioHangChiTiet = gioHangChiTietRepository.findById(idGioHangChiTiet)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Sản phẩm không tồn tại trong giỏ hàng"));

        if (soLuongMoi <= 0) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Số lượng phải lớn hơn 0");
        }

        gioHangChiTiet.setSoLuong(soLuongMoi);
        double ThanhTien = gioHangChiTiet.getSanPhamChiTiet().getGia() * soLuongMoi;
        gioHangChiTiet.setDonGia(ThanhTien / soLuongMoi);
        gioHangChiTiet.setNgaySua(LocalDate.now());

        gioHangChiTiet = gioHangChiTietRepository.save(gioHangChiTiet);

        //  Lấy ảnh đầu tiên từ bảng Anh
        String anhUrl = anhRepository.findFirstBySanPhamIdAndTrangThaiOrderByNgayTaoAsc(
                        gioHangChiTiet.getSanPhamChiTiet().getSanPham().getId(), 1)
                .map(Anh::getAnhUrl)
                .orElse(null); // Nếu không có ảnh thì để null

        //  Chỉ lấy giá trị giảm (mặc định là giảm theo %)
        Double giaTriGiam = (gioHangChiTiet.getSanPhamChiTiet().getKhuyenMai() != null) ?
                gioHangChiTiet.getSanPhamChiTiet().getKhuyenMai().getGiaTriGiam() : 0.0;

        //  Trả về thông tin giỏ hàng sau khi cập nhật
        return new GioHangChiTietResponse(
                gioHangChiTiet.getId(),
                anhUrl,
                gioHangChiTiet.getSanPhamChiTiet().getSanPham().getTen(),
                gioHangChiTiet.getSanPhamChiTiet().getMauSac().getTen(),
                gioHangChiTiet.getSanPhamChiTiet().getSize().getTen(),
                gioHangChiTiet.getSoLuong(),
                gioHangChiTiet.getDonGia(),
                giaTriGiam, // Chỉ giảm theo %
                gioHangChiTiet.getTrangThai(),
                gioHangChiTiet.getKhachHang().getId(),
                gioHangChiTiet.getSanPhamChiTiet().getId()
        );
    }
}
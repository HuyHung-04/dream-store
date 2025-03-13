package com.example.dreambackend.services.giohangchitiet;

import com.example.dreambackend.entities.*;
import com.example.dreambackend.repositories.*;
import com.example.dreambackend.requests.GioHangChiTietRequest;
import com.example.dreambackend.responses.GioHangChiTietResponse;
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
    public GioHangChiTietResponse themSanPhamVaoGio(GioHangChiTietRequest request) {
        Optional<GioHangChiTiet> existingItem = gioHangChiTietRepository.findByKhachHangIdAndSanPhamChiTietId(
                request.getIdKhachHang(), request.getIdSanPhamChiTiet()
        );

        GioHangChiTiet gioHangChiTiet;
        if (existingItem.isPresent()) {
            gioHangChiTiet = existingItem.get();
            gioHangChiTiet.setSoLuong(gioHangChiTiet.getSoLuong() + request.getSoLuong());
            gioHangChiTiet.setNgaySua(LocalDate.now());

            gioHangChiTiet.setDonGia(gioHangChiTiet.getSanPhamChiTiet().getGia() * gioHangChiTiet.getSoLuong());
        } else {
            gioHangChiTiet = new GioHangChiTiet();
            gioHangChiTiet.setKhachHang(khachHangRepository.findById(request.getIdKhachHang()).orElseThrow());
            gioHangChiTiet.setSanPhamChiTiet(sanPhamChiTietRepository.findById(request.getIdSanPhamChiTiet()).orElseThrow());
            gioHangChiTiet.setSoLuong(request.getSoLuong());
            // Tính đơn giá: giá sản phẩm × số lượng
            gioHangChiTiet.setTrangThai(1);
            gioHangChiTiet.setDonGia(gioHangChiTiet.getSanPhamChiTiet().getGia() * gioHangChiTiet.getSoLuong());
            gioHangChiTiet.setNgayTao(LocalDate.now());
            gioHangChiTiet.setNgaySua(LocalDate.now());
        }

        gioHangChiTiet = gioHangChiTietRepository.save(gioHangChiTiet);

        // Lấy ảnh đầu tiên từ bảng Anh
        String anhUrl = anhRepository.findFirstBySanPhamIdAndTrangThaiOrderByNgayTaoAsc(
                        gioHangChiTiet.getSanPhamChiTiet().getSanPham().getId(), 1)
                .map(Anh::getAnhUrl)
                .orElse(null); // Nếu không có ảnh thì để null

        KhuyenMai khuyenMai = gioHangChiTiet.getSanPhamChiTiet().getKhuyenMai();
        Boolean hinhThucGiam = (khuyenMai != null) ? khuyenMai.getHinhThucGiam() : null;
        Double giaTriGiam = (khuyenMai != null) ? khuyenMai.getGiaTriGiam() : null;

        return new GioHangChiTietResponse(
                gioHangChiTiet.getId(),
                anhUrl, // Đã sửa lỗi lấy ảnh đúng
                gioHangChiTiet.getSanPhamChiTiet().getSanPham().getTen(),
                gioHangChiTiet.getSanPhamChiTiet().getMauSac().getTen(), // Lấy tên màu sắc
                gioHangChiTiet.getSanPhamChiTiet().getSize().getTen(), // Lấy tên kích thước
                gioHangChiTiet.getSoLuong(),
                gioHangChiTiet.getDonGia(), // Đơn giá đã cập nhật
                hinhThucGiam,
                giaTriGiam,
                gioHangChiTiet.getTrangThai(),
                gioHangChiTiet.getKhachHang().getId(),
                gioHangChiTiet.getSanPhamChiTiet().getId()
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
        gioHangChiTiet.setDonGia(gioHangChiTiet.getSanPhamChiTiet().getGia() * soLuongMoi);
        gioHangChiTiet.setNgaySua(LocalDate.now());

        gioHangChiTiet = gioHangChiTietRepository.save(gioHangChiTiet);
        // Lấy ảnh đầu tiên từ bảng Anh
        String anhUrl = anhRepository.findFirstBySanPhamIdAndTrangThaiOrderByNgayTaoAsc(
                        gioHangChiTiet.getSanPhamChiTiet().getSanPham().getId(), 1)
                .map(Anh::getAnhUrl)
                .orElse(null); // Nếu không có ảnh thì để null

        return new GioHangChiTietResponse(
                gioHangChiTiet.getId(),
                anhUrl,
                gioHangChiTiet.getSanPhamChiTiet().getSanPham().getTen(),
                gioHangChiTiet.getSanPhamChiTiet().getMauSac().getTen(),
                gioHangChiTiet.getSanPhamChiTiet().getSize().getTen(),
                gioHangChiTiet.getSoLuong(),
                gioHangChiTiet.getDonGia(),
                gioHangChiTiet.getSanPhamChiTiet().getKhuyenMai() != null ? gioHangChiTiet.getSanPhamChiTiet().getKhuyenMai().getHinhThucGiam() : null,
                gioHangChiTiet.getSanPhamChiTiet().getKhuyenMai() != null ? gioHangChiTiet.getSanPhamChiTiet().getKhuyenMai().getGiaTriGiam() : null,
                gioHangChiTiet.getTrangThai(),
                gioHangChiTiet.getKhachHang().getId(),
                gioHangChiTiet.getSanPhamChiTiet().getId()
        );
    }







}
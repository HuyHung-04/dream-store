package com.example.dreambackend.services.sanphamchitiet;

import com.example.dreambackend.entities.MauSac;
import com.example.dreambackend.entities.SanPhamChiTiet;
import com.example.dreambackend.entities.Size;
import com.example.dreambackend.repositories.MauSacRepository;
import com.example.dreambackend.repositories.SanPhamChiTietRepository;
import com.example.dreambackend.repositories.SanPhamRepository;
import com.example.dreambackend.repositories.SizeRepository;
import com.example.dreambackend.requests.SanPhamChiTietRequest;
import com.example.dreambackend.responses.GetSanPhamToBanHangRespone;
import com.example.dreambackend.responses.SanPhamChiTietRespone;
import org.apache.poi.ss.usermodel.Cell;
import org.apache.poi.ss.usermodel.Row;
import org.apache.poi.ss.usermodel.Sheet;
import org.apache.poi.ss.usermodel.Workbook;
import org.apache.poi.xssf.usermodel.XSSFWorkbook;
import org.springframework.beans.BeanUtils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;

import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;
import java.util.Random;

@Service
public class SanPhamChiTietService implements ISanPhamChiTietService {
    @Autowired
    SanPhamChiTietRepository sanPhamChiTietRepository;

    @Autowired
    SanPhamRepository sanPhamRepository;

    @Autowired
    SizeRepository sizeRepository;

    @Autowired
    MauSacRepository mauSacRepository;

    @Override
    public Page<SanPhamChiTietRespone> getSanPhamChiTietBySanPhamId(Integer idSanPham, Pageable pageable) {
        return sanPhamChiTietRepository.getSanPhamChiTietBySanPhamId(idSanPham, pageable);
    }

    @Override
    public SanPhamChiTiet getsanPhamChiTietById(Integer id) {
        return sanPhamChiTietRepository.findById(id).orElseThrow(()->
                new RuntimeException("Không tìm thấy id sản phẩm chi tiết"));
    }

    @Override
    public List<SanPhamChiTiet> addSanPhamChiTiet(SanPhamChiTietRequest sanPhamChiTietRequest) {
        List<SanPhamChiTiet> sanPhamChiTietList = new ArrayList<>();
        if (sanPhamChiTietRequest.getSanPham() == null) {
            throw new RuntimeException("Sản phẩm không được để trống");
        }
        for (Integer sizeId : sanPhamChiTietRequest.getSizes()) {
            Optional<Size> optionalSize = sizeRepository.findById(sizeId);
            if (optionalSize.isEmpty()) {
                throw new RuntimeException("Size không tồn tại với ID: " + sizeId);
            }
            Size size = optionalSize.get();
            for (Integer mauSacId : sanPhamChiTietRequest.getMauSacs()) {
                Optional<MauSac> optionalMauSac = mauSacRepository.findById(mauSacId);
                if (optionalMauSac.isEmpty()) {
                    throw new RuntimeException("Màu sắc không tồn tại với ID: " + mauSacId);
                }
                MauSac mauSac = optionalMauSac.get();
                // Kiểm tra xem sản phẩm đã tồn tại chưa
                Optional<SanPhamChiTiet> existingSanPhamChiTiet = sanPhamChiTietRepository
                        .findBySanPhamAndSizeAndMauSac(sanPhamChiTietRequest.getSanPham(), size, mauSac);
                if (existingSanPhamChiTiet.isPresent()) {
                    throw new RuntimeException("Sản phẩm chi tiết với size và màu sắc đã tồn tại");
                }
                // Nếu chưa tồn tại -> Tạo mới
                SanPhamChiTiet sanPhamChiTiet = new SanPhamChiTiet();
                sanPhamChiTiet.setMa(taoMaSanPhamChiTiet());
                sanPhamChiTiet.setNgayTao(LocalDate.now());
                sanPhamChiTiet.setNgaySua(LocalDate.now());
                sanPhamChiTiet.setGia(sanPhamChiTietRequest.getGia());
                sanPhamChiTiet.setSoLuong(sanPhamChiTietRequest.getSoLuong());
                sanPhamChiTiet.setTrangThai(sanPhamChiTietRequest.getTrangThai());
                sanPhamChiTiet.setSanPham(sanPhamChiTietRequest.getSanPham());
                sanPhamChiTiet.setSize(size);
                sanPhamChiTiet.setMauSac(mauSac);
                sanPhamChiTietList.add(sanPhamChiTietRepository.save(sanPhamChiTiet));
            }
        }
        return sanPhamChiTietList;
    }

    private String taoMaSanPhamChiTiet() {
        Random random = new Random();
        String maSanPhamChiTiet;
        do {
            int soNgauNhien = 1 + random.nextInt(9999); // Sinh số từ 1 đến 9999
            String maSo = String.format("%04d", soNgauNhien); // Định dạng thành 4 chữ số
            maSanPhamChiTiet = "SPCT" + maSo;
        } while (sanPhamChiTietRepository.existsByMa(maSanPhamChiTiet)); // Kiểm tra xem mã đã tồn tại chưa
        return maSanPhamChiTiet;
    }


    @Override
    public SanPhamChiTiet updateSanPhamChiTiet(SanPhamChiTietRequest sanPhamChiTietRequest) {
        SanPhamChiTiet sanphamChiTietUpdate = sanPhamChiTietRepository.findById(sanPhamChiTietRequest.getId())
                .orElseThrow(() -> new RuntimeException("Không tìm thấy sản phẩm chi tiết với id: " + sanPhamChiTietRequest.getId()));
        // Copy dữ liệu nhưng loại bỏ danh sách sizes và mauSacs
        BeanUtils.copyProperties(sanPhamChiTietRequest, sanphamChiTietUpdate, "id", "ngayTao", "sizes", "mauSacs");
        // Gán size mới nếu có
        if (sanPhamChiTietRequest.getSizes() != null && !sanPhamChiTietRequest.getSizes().isEmpty()) {
            sanphamChiTietUpdate.setSize(sizeRepository.findById(sanPhamChiTietRequest.getSizes().get(0))
                    .orElseThrow(() -> new RuntimeException("Không tìm thấy size với id: " + sanPhamChiTietRequest.getSizes().get(0))));
        }
        // Gán màu sắc mới nếu có
        if (sanPhamChiTietRequest.getMauSacs() != null && !sanPhamChiTietRequest.getMauSacs().isEmpty()) {
            sanphamChiTietUpdate.setMauSac(mauSacRepository.findById(sanPhamChiTietRequest.getMauSacs().get(0))
                    .orElseThrow(() -> new RuntimeException("Không tìm thấy màu sắc với id: " + sanPhamChiTietRequest.getMauSacs().get(0))));
        }
        sanphamChiTietUpdate.setNgaySua(LocalDate.now());
        return sanPhamChiTietRepository.save(sanphamChiTietUpdate);
    }


    @Override
    public Page<SanPhamChiTietRespone> timKiemSanPhamChiTiet(
            Integer idSanPham, Double gia, Integer soLuong, Integer idMauSac, Integer idSize, Integer trangThai, Pageable pageable) {

        return sanPhamChiTietRepository.timKiemSanPhamChiTiet(
                idSanPham, gia, soLuong, idMauSac, idSize, trangThai, pageable);
    }

    @Override
    public ResponseEntity<byte[]> exportSanPhamChiTietToExcel(List<SanPhamChiTietRespone> sanPhamChiTiets) {
        try (Workbook workbook = new XSSFWorkbook()) {
            Sheet sheet = workbook.createSheet("Sản Phẩm Chi Tiết");
            Row headerRow = sheet.createRow(0);
            String[] headers = {"Mã SPCT", "Tên Sản Phẩm", "Giá", "Số Lượng", "Ngày Tạo", "Ngày Sửa","Tên Khuyến Mãi", "Giá Sau Giảm", "Trạng Thái"};

            for (int i = 0; i < headers.length; i++) {
                Cell cell = headerRow.createCell(i);
                cell.setCellValue(headers[i]);
            }

            int rowNum = 1;
            for (SanPhamChiTietRespone sp : sanPhamChiTiets) {
                Row row = sheet.createRow(rowNum++);
                row.createCell(0).setCellValue(sp.getMa());
                row.createCell(1).setCellValue(sp.getTenSanPham());
                row.createCell(2).setCellValue(sp.getGia());
                row.createCell(3).setCellValue(sp.getSoLuong());
                row.createCell(4).setCellValue(sp.getNgayTao().toString());
                row.createCell(5).setCellValue(sp.getNgaySua().toString());
                row.createCell(6).setCellValue(sp.getTenKhuyenMai() != null ? sp.getTenKhuyenMai() : "Không áp dụng");
                row.createCell(7).setCellValue(sp.getGiaSauGiam());
                row.createCell(8).setCellValue(sp.getTrangThai() == 1 ?"Đang hoạt động":"Không hoạt động");
            }

            ByteArrayOutputStream outputStream = new ByteArrayOutputStream();
            workbook.write(outputStream);
            HttpHeaders headersResponse = new HttpHeaders();
            headersResponse.add("Content-Disposition", "attachment; filename=sanphamchitiet.xlsx");
            return new ResponseEntity<>(outputStream.toByteArray(), headersResponse, HttpStatus.OK);
        } catch (IOException e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    @Override
    public Page<GetSanPhamToBanHangRespone> laySanPhamChoBanHang(Pageable pageable) {
        return sanPhamChiTietRepository.getSanPhamForBanHang(pageable);
    }

    public Page<GetSanPhamToBanHangRespone> locSanPham(String tenSanPham, String mauSac, String size, int page, int sizePage) {
        Pageable pageable = PageRequest.of(page, sizePage);
        return sanPhamChiTietRepository.searchSanPhamForBanHang(tenSanPham, mauSac, size, pageable);
    }

    @Override
    public Page<GetSanPhamToBanHangRespone> laySanPhamChoCheckBanHang(Pageable pageable) {
        return sanPhamChiTietRepository.getSanPhamForCheckBanHang(pageable);
    }

    @Override
    public SanPhamChiTiet updateSoLuongBanHang(Integer id, Integer soLuong, Boolean isIncrease) {
        // Lấy thông tin sản phẩm chi tiết
        SanPhamChiTiet sanPhamChiTiet = getsanPhamChiTietById(id);
        if (sanPhamChiTiet == null) {
            throw new RuntimeException("Không tìm thấy sản phẩm");
        }

        // Tính toán số lượng mới
        int currentQuantity = sanPhamChiTiet.getSoLuong();
        int newQuantity;
        if (isIncrease) {
            newQuantity = currentQuantity + soLuong;
        } else {
            newQuantity = currentQuantity - soLuong;
            if (newQuantity < 0) {
                throw new RuntimeException("Số lượng không đủ");
            }
        }

        // Cập nhật số lượng mới
        sanPhamChiTiet.setSoLuong(newQuantity);
        return sanPhamChiTietRepository.save(sanPhamChiTiet);
    }

}

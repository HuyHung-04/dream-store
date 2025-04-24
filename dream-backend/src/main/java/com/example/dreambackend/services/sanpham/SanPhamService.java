package com.example.dreambackend.services.sanpham;

import com.example.dreambackend.entities.*;
import com.example.dreambackend.repositories.*;
import com.example.dreambackend.requests.SanPhamRequest;
import com.example.dreambackend.responses.SanPhamRespone;
import jakarta.transaction.Transactional;
import org.apache.poi.ss.usermodel.Cell;
import org.apache.poi.ss.usermodel.Row;
import org.apache.poi.ss.usermodel.Sheet;
import org.apache.poi.ss.usermodel.Workbook;
import org.apache.poi.xssf.usermodel.XSSFWorkbook;
import org.springframework.beans.BeanUtils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;

import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.time.LocalDate;
import java.util.List;
import java.util.Random;

@Service
public class SanPhamService implements ISanPhamService {
    @Autowired
    SanPhamRepository sanPhamRepository;
    @Autowired
    SanPhamChiTietRepository sanPhamChiTietRepository;
    @Override
    public Page<SanPhamRespone> getAllSanPham(Pageable pageable) {
        return sanPhamRepository.getAllSanPhamRepone(pageable);
    }

    @Override
    public SanPham addSanPham(SanPhamRequest sanPhamRequest) {
        SanPham sanPham = new SanPham();
        // Copy các thuộc tính cơ bản từ request sang entity
        BeanUtils.copyProperties(sanPhamRequest, sanPham);
        sanPham.setMa(taoMaSanPham());
        // Set ngày tạo và ngày sửa
        sanPham.setNgayTao(LocalDate.now());

        // Lưu sản phẩm
        return sanPhamRepository.save(sanPham);
    }

    public boolean existsTenSanPham(String ten){
        return sanPhamRepository.existsByTen(ten);
    }

    private String taoMaSanPham() {
        Random random = new Random();
        String maSanPham;
        do {
            int soNgauNhien = 1 + random.nextInt(9999); // Sinh số từ 1 đến 9999
            String maSo = String.format("%04d", soNgauNhien); // Định dạng thành 4 chữ số
            maSanPham = "SP" + maSo;
        } while (sanPhamRepository.existsByMa(maSanPham)); // Kiểm tra xem mã đã tồn tại chưa
        return maSanPham;
    }


    @Override
    @Transactional
    public SanPham updateSanPham(SanPhamRequest sanPhamRequest) {
        // Tìm sản phẩm cần cập nhật
        SanPham sanPhamUpdate = sanPhamRepository.findById(sanPhamRequest.getId())
                .orElseThrow(() -> new RuntimeException("Không tìm thấy sản phẩm với id: " + sanPhamRequest.getId()));
        // Sao chép dữ liệu nhưng giữ nguyên id và ngày tạo
        BeanUtils.copyProperties(sanPhamRequest, sanPhamUpdate, "id", "ngayTao");
        sanPhamUpdate.setNgaySua(LocalDate.now());
        // Lưu sản phẩm đã cập nhật
        sanPhamUpdate = sanPhamRepository.save(sanPhamUpdate);
        // Cập nhật trạng thái sản phẩm chi tiết nếu có sự thay đổi trạng thái
        if (sanPhamRequest.getTrangThai() != null) {
            List<SanPhamChiTiet> danhSachChiTiet = sanPhamChiTietRepository.findBySanPhamId(sanPhamUpdate.getId());
            for (SanPhamChiTiet chiTiet : danhSachChiTiet) {
                chiTiet.setTrangThai(sanPhamRequest.getTrangThai()); // Đồng bộ trạng thái
                sanPhamChiTietRepository.save(chiTiet);
            }
        }
        return sanPhamUpdate;
    }


    @Override
    public SanPham getSanPhamById(Integer id) {
        return sanPhamRepository.findById(id).orElseThrow(()->
                new RuntimeException("Không tìm thấy id sản phẩm"));
    }

    public Page<SanPhamRespone> searchSanPham(
            Integer thuongHieuId, Integer xuatXuId, Integer chatLieuId, Integer coAoId, Integer trangThai, String ten, Pageable pageable) {
        return sanPhamRepository.searchSanPham(thuongHieuId, xuatXuId, chatLieuId, coAoId, trangThai, ten, pageable);
    }

    @Override
    public ResponseEntity<byte[]> exportSanPhamToExcel(List<SanPhamRespone> sanPhams) {
        try (Workbook workbook = new XSSFWorkbook()) {
            Sheet sheet = workbook.createSheet("Sản Phẩm");
            Row headerRow = sheet.createRow(0);
            String[] headers = {"Mã", "Tên Sản Phẩm", "Thương Hiệu", "Xuất Xứ", "Chất Liệu", "Cổ áo", "Giá", "Tổng số Lượng", "Ngày Tạo", "Ngày Sửa", "Trạng Thái"};

            for (int i = 0; i < headers.length; i++) {
                Cell cell = headerRow.createCell(i);
                cell.setCellValue(headers[i]);
            }

            int rowNum = 1;
            for (SanPhamRespone sp : sanPhams) {
                Row row = sheet.createRow(rowNum++);
                row.createCell(0).setCellValue(sp.getMa());
                row.createCell(1).setCellValue(sp.getTen());
                row.createCell(2).setCellValue(sp.getTenThuongHieu());
                row.createCell(3).setCellValue(sp.getTenXuatXu());
                row.createCell(4).setCellValue(sp.getTenChatLieu());
                row.createCell(5).setCellValue(sp.getTenCoAo());
                row.createCell(6).setCellValue(sp.getGiaCaoNhat());
                row.createCell(7).setCellValue(sp.getTongSoLuong());
                row.createCell(8).setCellValue(sp.getNgayTao().toString());
                row.createCell(9).setCellValue(sp.getNgaySua().toString());
                row.createCell(10).setCellValue(sp.getTrangThai() == 1 ?"Đang hoạt động":"Không hoạt động");
            }

            ByteArrayOutputStream outputStream = new ByteArrayOutputStream();
            workbook.write(outputStream);
            HttpHeaders headersResponse = new HttpHeaders();
            headersResponse.add("Content-Disposition", "attachment; filename=sanpham.xlsx");
            return new ResponseEntity<>(outputStream.toByteArray(), headersResponse, HttpStatus.OK);
        } catch (IOException e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }
}

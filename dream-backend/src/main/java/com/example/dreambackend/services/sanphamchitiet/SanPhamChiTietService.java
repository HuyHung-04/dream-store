package com.example.dreambackend.services.sanphamchitiet;

import com.example.dreambackend.entities.SanPham;
import com.example.dreambackend.entities.SanPhamChiTiet;
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
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.time.LocalDate;
import java.util.List;
import java.util.Random;

@Service
public class SanPhamChiTietService implements ISanPhamChiTietService {
    @Autowired
    SanPhamChiTietRepository sanPhamChiTietRepository;

    @Autowired
    SanPhamRepository sanPhamRepository;

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
    public SanPhamChiTiet addSanPhamChiTiet(SanPhamChiTietRequest sanPhamChiTietRequest) {
        SanPhamChiTiet sanPhamChiTiet = new SanPhamChiTiet();
        BeanUtils.copyProperties(sanPhamChiTietRequest,sanPhamChiTiet);
        sanPhamChiTiet.setMa(taoMaSanPhamChiTiet());
        sanPhamChiTiet.setNgayTao(LocalDate.now());
        sanPhamChiTiet.setNgaySua(LocalDate.now());
        return sanPhamChiTietRepository.save(sanPhamChiTiet);
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
        // Kiểm tra trạng thái sản phẩm cha
        SanPham sanPhamCha = sanPhamRepository.findById(sanphamChiTietUpdate.getSanPham().getId())
                .orElseThrow(() -> new RuntimeException("Không tìm thấy sản phẩm cha"));
        if (sanPhamCha.getTrangThai() == 0) { // 0 là "không hoạt động"
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Sản phẩm không hoạt động, không thể sửa trạng thái!");
        }
        BeanUtils.copyProperties(sanPhamChiTietRequest, sanphamChiTietUpdate, "id", "ngayTao");
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
            String[] headers = {"Mã SPCT", "Tên Sản Phẩm", "Giá", "Số Lượng", "Ngày Tạo", "Ngày Sửa", "Trạng Thái"};

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
                row.createCell(6).setCellValue(sp.getTrangThai());
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
}

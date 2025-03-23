package com.example.dreambackend.services.pdf;

import com.example.dreambackend.entities.*;
import com.example.dreambackend.repositories.HoaDonRepository;
import com.example.dreambackend.repositories.HoaDonChiTietRepository;
import com.itextpdf.io.font.FontProgramFactory;
import com.itextpdf.io.font.PdfEncodings;
import com.itextpdf.kernel.colors.ColorConstants;
import com.itextpdf.kernel.font.PdfFont;
import com.itextpdf.kernel.font.PdfFontFactory;
import com.itextpdf.kernel.pdf.*;
import com.itextpdf.layout.Document;
import com.itextpdf.layout.element.*;
import com.itextpdf.layout.properties.TextAlignment;
import com.itextpdf.layout.properties.UnitValue;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.text.DecimalFormat;
import java.util.List;

@Service
public class PdfService {

    @Autowired
    private HoaDonRepository hoaDonRepository;

    @Autowired
    private HoaDonChiTietRepository hoaDonChiTietRepository;

    public byte[] generateInvoicePdf(Integer idHoaDon) throws IOException {
        HoaDon hoaDon = hoaDonRepository.findById(idHoaDon)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy hóa đơn"));

        List<HoaDonChiTiet> chiTietList = hoaDonChiTietRepository.getHoaDonChiTietByHoaDonId(idHoaDon);

        ByteArrayOutputStream outputStream = new ByteArrayOutputStream();
        PdfWriter writer = new PdfWriter(outputStream);
        PdfDocument pdfDoc = new PdfDocument(writer);
        Document document = new Document(pdfDoc);

        // **Khai báo DecimalFormat**
        DecimalFormat formatter = new DecimalFormat("#,###.##");

        // **Nhúng font tiếng Việt**
        String fontPath = "src/main/resources/fonts/timesnewroman.ttf";
        PdfFont vietnameseFont = PdfFontFactory.createFont(FontProgramFactory.createFont(fontPath), PdfEncodings.IDENTITY_H);

        // **Tiêu đề hóa đơn**
        Paragraph title = new Paragraph("HÓA ĐƠN BÁN HÀNG")
                .setFont(vietnameseFont)
                .setFontSize(18)
                .setBold()
                .setTextAlignment(TextAlignment.CENTER)
                .setFontColor(ColorConstants.BLUE);
        document.add(title);
        document.add(new Paragraph("\n"));

        // **Thông tin khách hàng**
        document.add(new Paragraph("Mã hóa đơn: " + hoaDon.getMa()).setFont(vietnameseFont));
        document.add(new Paragraph("Nhân viên phụ trách: " + (hoaDon.getNhanVien() != null ? hoaDon.getNhanVien().getTen() : "N/A")).setFont(vietnameseFont));
        document.add(new Paragraph("Tên khách hàng: " + (hoaDon.getKhachHang() != null ? hoaDon.getKhachHang().getTen() : "N/A")).setFont(vietnameseFont));
        document.add(new Paragraph("Số điện thoại: " + (hoaDon.getKhachHang() != null ? hoaDon.getKhachHang().getSoDienThoai() : "N/A")).setFont(vietnameseFont));
        document.add(new Paragraph("Ngày tạo: " + hoaDon.getNgayTao()).setFont(vietnameseFont));
        document.add(new Paragraph("Voucher sử dụng: " + (hoaDon.getVoucher() != null ? hoaDon.getVoucher().getTen() : "Không có")).setFont(vietnameseFont));
        document.add(new Paragraph("\n"));

        // **Bảng sản phẩm**
        Table table = new Table(new float[]{1, 3, 2, 2, 3, 2});
        table.setWidth(UnitValue.createPercentValue(100));

        // **Tiêu đề cột**
        String[] headers = {"STT", "Tên SP", "Màu sắc", "Size", "Đơn giá", "Số lượng"};
        for (String header : headers) {
            table.addHeaderCell(new Cell().add(new Paragraph(header).setFont(vietnameseFont).setBold()));
        }

        // **Thêm dữ liệu sản phẩm**
        int index = 1;
        for (HoaDonChiTiet hdct : chiTietList) {
            SanPhamChiTiet spct = hdct.getSanPhamChiTiet();
            SanPham sp = spct.getSanPham();

            table.addCell(new Cell().add(new Paragraph(String.valueOf(index++)).setFont(vietnameseFont))); // Fix lỗi số thứ tự
            table.addCell(new Cell().add(new Paragraph(sp != null ? sp.getTen() : "N/A").setFont(vietnameseFont)));
            table.addCell(new Cell().add(new Paragraph(spct.getMauSac() != null ? spct.getMauSac().getTen() : "N/A").setFont(vietnameseFont)));
            table.addCell(new Cell().add(new Paragraph(spct.getSize() != null ? spct.getSize().getTen() : "N/A").setFont(vietnameseFont)));
            table.addCell(new Cell().add(new Paragraph(formatter.format(spct.getGia() != null ? spct.getGia() : 0.0)).setFont(vietnameseFont))); // Fix lỗi formatter
            table.addCell(new Cell().add(new Paragraph(String.valueOf(hdct.getSoLuong())).setFont(vietnameseFont)));
        }

        document.add(table);
        document.add(new Paragraph("\n"));

        // **Tổng tiền**
        document.add(new Paragraph("Tổng tiền trước voucher: " + (hoaDon.getTongTienTruocVoucher() != null ? formatter.format(hoaDon.getTongTienTruocVoucher()) : "0")).setFont(vietnameseFont).setBold());
        document.add(new Paragraph("Tổng tiền thanh toán: " + (hoaDon.getTongTienThanhToan() != null ? formatter.format(hoaDon.getTongTienThanhToan()) : "0")).setFont(vietnameseFont).setBold());

        document.close();
        return outputStream.toByteArray();
    }
}
package com.example.dreambackend.services.pdf;

import com.example.dreambackend.entities.*;
import com.example.dreambackend.repositories.HoaDonRepository;
import com.example.dreambackend.repositories.HoaDonChiTietRepository;
import com.itextpdf.kernel.colors.ColorConstants;
import com.itextpdf.kernel.pdf.*;
import com.itextpdf.layout.Document;
import com.itextpdf.layout.element.*;
import com.itextpdf.layout.properties.TextAlignment;
import com.itextpdf.layout.properties.UnitValue;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.io.ByteArrayOutputStream;
import java.io.IOException;
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

        // Tiêu đề hóa đơn
        Paragraph title = new Paragraph("HOA DON BAN HANG")
                .setFontSize(18)
                .setBold()
                .setTextAlignment(TextAlignment.CENTER)
                .setFontColor(ColorConstants.BLUE);
        document.add(title);

        document.add(new Paragraph("\n"));

        // Thông tin khách hàng
        document.add(new Paragraph("Ma hoa don: " + hoaDon.getMa()));
        document.add(new Paragraph("Ten khach hang: " + hoaDon.getKhachHang().getTen()));
        document.add(new Paragraph("So dien thoai: " + hoaDon.getKhachHang().getSoDienThoai()));
        document.add(new Paragraph("Ngay tao: " + hoaDon.getNgayTao()));
        document.add(new Paragraph("\n"));

        // Bảng sản phẩm
        Table table = new Table(new float[]{2, 4, 3, 3, 3, 3, 3, 3, 3});
        table.setWidth(UnitValue.createPercentValue(100));

        table.addHeaderCell(new Cell().add(new Paragraph("STT")).setBold());
        table.addHeaderCell(new Cell().add(new Paragraph("Ten SP")).setBold());
        table.addHeaderCell(new Cell().add(new Paragraph("Mau sac")).setBold());
        table.addHeaderCell(new Cell().add(new Paragraph("Size")).setBold());
        table.addHeaderCell(new Cell().add(new Paragraph("Chat lieu")).setBold());
        table.addHeaderCell(new Cell().add(new Paragraph("Thuong hieu")).setBold());
        table.addHeaderCell(new Cell().add(new Paragraph("Co ao")).setBold());
        table.addHeaderCell(new Cell().add(new Paragraph("Xuat xu")).setBold());

        int index = 1;
        for (HoaDonChiTiet hdct : chiTietList) {
            SanPhamChiTiet spct = hdct.getSanPhamChiTiet();
            SanPham sp = spct.getSanPham();

            table.addCell(new Cell().add(new Paragraph(String.valueOf(index++))));
            table.addCell(new Cell().add(new Paragraph(sp.getTen())));
            table.addCell(new Cell().add(new Paragraph(spct.getMauSac() != null ? spct.getMauSac().getTen() : "N/A")));
            table.addCell(new Cell().add(new Paragraph(spct.getSize() != null ? spct.getSize().getTen() : "N/A")));
            table.addCell(new Cell().add(new Paragraph(sp.getChatLieu() != null ? sp.getChatLieu().getTen() : "N/A")));
            table.addCell(new Cell().add(new Paragraph(sp.getThuongHieu() != null ? sp.getThuongHieu().getTen() : "N/A")));
            table.addCell(new Cell().add(new Paragraph(sp.getCoAo() != null ? sp.getCoAo().getTen() : "N/A")));
            table.addCell(new Cell().add(new Paragraph(sp.getXuatXu() != null ? sp.getXuatXu().getTen() : "N/A")));
        }

        document.add(table);
        document.add(new Paragraph("\n"));

        // Tổng tiền
        document.add(new Paragraph("Tong tien truoc voucher: " + hoaDon.getTongTienTruocVoucher()).setBold());
        document.add(new Paragraph("Tong tien thanh toan: " + hoaDon.getTongTienThanhToan()).setBold());

        document.close();
        return outputStream.toByteArray();
    }
}
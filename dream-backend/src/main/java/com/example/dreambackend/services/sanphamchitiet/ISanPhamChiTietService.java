package com.example.dreambackend.services.sanphamchitiet;

import com.example.dreambackend.entities.SanPhamChiTiet;
import com.example.dreambackend.requests.SanPhamChiTietRequest;
import com.example.dreambackend.responses.GetSanPhamToBanHangRespone;
import com.example.dreambackend.responses.SanPhamChiTietRespone;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;

import java.util.List;

public interface ISanPhamChiTietService {
    Page<SanPhamChiTietRespone> getSanPhamChiTietBySanPhamId(Integer idSanPham, Pageable pageable);
    Page<SanPhamChiTietRespone> timKiemSanPhamChiTiet(
           Integer idSanPham, Double gia, Integer soLuong, Integer idMauSac, Integer idSize, Integer trangThai, Pageable pageable);

    SanPhamChiTiet getsanPhamChiTietById(Integer id);

    List<SanPhamChiTiet> addSanPhamChiTiet(SanPhamChiTietRequest sanPhamChiTietRequest);

    SanPhamChiTiet updateSanPhamChiTiet(SanPhamChiTietRequest sanPhamChiTietRequest);

    ResponseEntity<byte[]> exportSanPhamChiTietToExcel(List<SanPhamChiTietRespone> sanPhamChiTiets);

//    Page<GetSanPhamToBanHangRespone> laySanPhamChoBanHang(Pageable pageable);
}

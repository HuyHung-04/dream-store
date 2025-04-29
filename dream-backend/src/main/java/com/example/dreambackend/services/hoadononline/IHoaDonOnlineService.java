package com.example.dreambackend.services.hoadononline;

import com.example.dreambackend.dtos.HoaDonChiTietDto;
import com.example.dreambackend.dtos.HoaDonDto;
import com.example.dreambackend.dtos.VoucherDto;
import com.example.dreambackend.entities.HoaDon;
import com.example.dreambackend.entities.HoaDonChiTiet;
import com.example.dreambackend.responses.GioHangChiTietResponse;

import java.util.List;

public interface IHoaDonOnlineService {
    List<Integer> getGioHangIdsForThanhToan(Integer idKhachHang);
    List<GioHangChiTietResponse> getChiTietGioHangSauThanhToan(Integer idKhachHang);
//    Double getTamTinh(Integer idKhachHang);
//    Double getTongTienThanhToan(Integer idKhachHang, Integer voucherId, Double shippingFee);
    List<VoucherDto> getVoucherIdAndTen(Double tongTien);
    HoaDon createHoaDon(Integer idKhachHang, Integer voucherId,Double tongTienTruocGiam, Integer paymentMethodId,Double TongTienSauGiam,String sdtNguoiNhan,String tenNguoiNhan,String diaChi,Double shippingFee);
    List<HoaDonChiTietDto> getHoaDonChiTiet(Integer idHoaDon);
    HoaDon huyHoaDon(Integer idHoaDon,String ghiChu);
    HoaDon tangTrangThaiHoaDon(Integer id);
    List<HoaDonDto> getHoaDonByKhachHang(Integer idKhachHang,Integer trangThai);
}

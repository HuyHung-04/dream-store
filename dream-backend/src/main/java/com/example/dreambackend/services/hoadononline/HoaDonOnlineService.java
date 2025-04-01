package com.example.dreambackend.services.hoadononline;
import java.util.*;

import com.example.dreambackend.dtos.HoaDonChiTietDto;
import com.example.dreambackend.dtos.HoaDonDto;
import com.example.dreambackend.dtos.VoucherDto;
import com.example.dreambackend.entities.*;
import com.example.dreambackend.repositories.*;
import com.example.dreambackend.responses.GioHangChiTietResponse;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.stream.Collectors;

@Service
public class HoaDonOnlineService implements IHoaDonOnlineService {

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

    @Autowired
    VoucherRepository voucherRepository;

    @Autowired
    PhuongThucThanhToanRepository phuongThucThanhToanRepository;

    @Override
    public List<Integer> getGioHangIdsForThanhToan(Integer idKhachHang) {
        gioHangChiTietRepository.deleteByKhachHangIdAndTrangThai(idKhachHang, 2);

        // Lấy danh sách giỏ hàng của khách hàng
        List<GioHangChiTietResponse> gioHangChiTietList = gioHangChiTietRepository.findGioHangChiTietByKhachHangId(idKhachHang);

        if (gioHangChiTietList.isEmpty()) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Không có sản phẩm nào trong giỏ hàng.");
        }

        List<Integer> gioHangIds = new ArrayList<>();

        for (GioHangChiTietResponse gioHang : gioHangChiTietList) {
            GioHangChiTiet gioHangChiTiet = gioHangChiTietRepository.findById(gioHang.getId())
                    .orElseThrow(() -> new RuntimeException("Giỏ hàng chi tiết không tồn tại"));

            gioHangChiTiet.setTrangThai(0);
            gioHangChiTietRepository.save(gioHangChiTiet);
            // Thêm vào danh sách ID giỏ hàng đã cập nhật
            gioHangIds.add(gioHangChiTiet.getId());
        }

        return gioHangIds;

    }

    @Override
    public List<GioHangChiTietResponse> getChiTietGioHangSauThanhToan(Integer idKhachHang) {
        return gioHangChiTietRepository.findGioHangChiTietByStatus(idKhachHang);
    }

    @Override
    public Double calculateTotalPrice(Integer idKhachHang) {
        // Lấy danh sách giỏ hàng chi tiết theo trạng thái và khách hàng
        List<GioHangChiTietResponse> gioHangChiTietResponses = gioHangChiTietRepository.findGioHangChiTietByStatus(idKhachHang);

        Double totalPrice = 0.0;

        // Duyệt qua danh sách và tính tổng tiền nếu trạng thái giỏ hàng là 0 hoặc 2
        for (GioHangChiTietResponse item : gioHangChiTietResponses) {
            if (item.getTrangThai() == 0 || item.getTrangThai() == 2) {
                totalPrice += item.getDonGia() * item.getSoLuong(); // Tính tổng theo số lượng và đơn giá
            }
        }

        return totalPrice;
    }


    @Override
    public List<VoucherDto> getVoucherIdAndTen(Double tongTien) {



        // Lấy tất cả voucher từ database
        List<VoucherDto> allVouchers = voucherRepository.findIdAndTen();

        // Lọc danh sách voucher dựa trên đơn tối thiểu
        return allVouchers.stream()
                .filter(v -> {
                    Voucher voucher = voucherRepository.findById(v.getId()).orElse(null);
                    return voucher != null && tongTien >= voucher.getDonToiThieu().doubleValue();
                })
                .collect(Collectors.toList());
    }

    // Phương thức tính tổng tiền sau khi áp dụng voucher
    @Override
    public Double calculateTotalPriceWithVoucher(Integer idKhachHang, Integer voucherId, Double shippingFee) {
        // Lấy chi tiết giỏ hàng của khách hàng
        List<GioHangChiTietResponse> gioHangChiTietResponses = gioHangChiTietRepository.findGioHangChiTietByStatus(idKhachHang);

        // Tính tổng tiền giỏ hàng
        Double totalPrice = 0.0;
        for (GioHangChiTietResponse item : gioHangChiTietResponses) {
            totalPrice += item.getDonGia() * item.getSoLuong();
        }

        Double discountAmount = 0.0;

        // Nếu có voucherId thì mới xử lý giảm giá
        if (voucherId != null) {
            Voucher voucher = voucherRepository.findById(voucherId)
                    .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Voucher không tồn tại"));

            if (voucher.isHinhThucGiam()) {
                // Giảm theo số tiền cố định
                discountAmount = voucher.getGiaTriGiam().doubleValue();
            } else {
                // Giảm theo phần trăm
                discountAmount = totalPrice * voucher.getGiaTriGiam().doubleValue() / 100;

                // Giảm tối đa chỉ áp dụng cho giảm theo phần trăm
                if (voucher.getGiamToiDa() != null && discountAmount > voucher.getGiamToiDa().doubleValue()) {
                    discountAmount = voucher.getGiamToiDa().doubleValue();
                }
            }


        }

        // Tổng tiền sau giảm = tổng - giảm + ship
        Double totalPriceAfterDiscount = (totalPrice - discountAmount) + shippingFee;

        return totalPriceAfterDiscount;
    }


    @Override
    public HoaDon createHoaDonAndAddProducts(Integer idKhachHang, Integer voucherId, Double tongTienTruocGiam, Integer paymentMethodId, Double TongTienSauGiam, String sdtNguoiNhan, String tenNguoiNhan, String diaChi, Double shippingFee) {
        // Lấy khách hàng từ repository
        KhachHang khachHang = khachHangRepository.findById(idKhachHang).orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Khách hàng không tồn tại"));
        // Lấy phương thức thanh toán từ repository
        PhuongThucThanhToan phuongThucThanhToan = phuongThucThanhToanRepository.findById(paymentMethodId).orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Phương thức thanh toán không tồn tại"));
        Voucher voucher = null;

        if (voucherId != null) {
            voucher = voucherRepository.findById(voucherId)
                    .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Voucher không tồn tại"));
        }


        // Bước 1: Tạo Hóa Đơn (HoaDon)
        HoaDon hoaDon = new HoaDon();
        hoaDon.setKhachHang(khachHang);
        hoaDon.setMa("HD" + (System.currentTimeMillis() % 10000000)); // Sinh mã hóa đơn (có thể thay đổi theo logic của bạn)
        hoaDon.setNgayTao(LocalDate.now());
        hoaDon.setNgaySua(LocalDate.now());
        hoaDon.setVoucher(voucher);
        // Nếu id phương thức thanh toán là 4, thì trạng thái hóa đơn là 2
        if (paymentMethodId == 4) {
            hoaDon.setTrangThai(2); // Trạng thái hóa đơn là 2
        } else {
            hoaDon.setTrangThai(1); // Đánh dấu hóa đơn là hoạt động
        }

        hoaDon.setPhuongThucThanhToan(phuongThucThanhToan); // Gán phương thức thanh toán cho hóa đơn
        hoaDon.setPhuongThucThanhToan(phuongThucThanhToan); // Gán phương thức thanh toán cho hóa đơn

        // Lưu hóa đơn vào repository
        hoaDonRepository.save(hoaDon);
        HoaDon hoaDon1 = hoaDonRepository.findById(hoaDon.getId()).orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Khách hàng không tồn tại"));
        // Bước 2: Thêm Sản Phẩm vào Hóa Đơn Chi Tiết (HoaDonChiTiet)
        List<GioHangChiTietResponse> gioHangChiTietResponses = gioHangChiTietRepository.findGioHangChiTietByStatus(idKhachHang);

        for (GioHangChiTietResponse item : gioHangChiTietResponses) {
            if (item.getTrangThai() == 0 || item.getTrangThai() == 2) {

                SanPhamChiTiet sanPhamChiTiet = sanPhamChiTietRepository.findById(item.getIdSanPhamChiTiet())
                        .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Sản phẩm chi tiết không tồn tại"));
                HoaDonChiTiet hoaDonChiTiet = new HoaDonChiTiet();
                hoaDonChiTiet.setMa("HDCT" + System.currentTimeMillis());
                hoaDonChiTiet.setHoaDon(hoaDon1);
                hoaDonChiTiet.setSanPhamChiTiet(sanPhamChiTiet);
                hoaDonChiTiet.setSoLuong(item.getSoLuong());
                hoaDonChiTiet.setDonGia(item.getDonGia());
                hoaDonChiTietRepository.save(hoaDonChiTiet);

//                // ✅ Trừ số lượng tồn kho của sản phẩm chi tiết
//                int soLuongHienTai = sanPhamChiTiet.getSoLuong();
//                int soLuongMua = item.getSoLuong();
//
//                if (soLuongHienTai < soLuongMua) {
//                    throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Số lượng sản phẩm không đủ trong kho");
//                }
//
//                sanPhamChiTiet.setSoLuong(soLuongHienTai - soLuongMua);
//                sanPhamChiTietRepository.save(sanPhamChiTiet);
            }
        }

        // Bước 3: Cập nhật tổng tiền cho hóa đơn
        hoaDon.setTongTienTruocVoucher(tongTienTruocGiam);
        hoaDon.setTongTienThanhToan(TongTienSauGiam); // Cộng thêm phí vận chuyển
        hoaDon.setTenNguoiNhan(tenNguoiNhan);
        hoaDon.setSdtNguoiNhan(sdtNguoiNhan);
        hoaDon.setDiaChiNhanHang(diaChi);
        hoaDon.setPhiVanChuyen(shippingFee);
        hoaDonRepository.save(hoaDon); // Lưu hóa đơn với tổng tiền đã tính toán
        gioHangChiTietRepository.deleteByTrangThaiIn(List.of(0, 2));
        return hoaDon; // Trả về hóa đơn đã tạo với thông tin chi tiết
    }


    public List<HoaDonChiTietDto> getChiTietHoaDonByMa(String maHoaDon) {
        // Lấy dữ liệu từ repository
        List<Object[]> results = hoaDonChiTietRepository.findChiTietByMaHoaDon(maHoaDon);

        // Kiểm tra nếu không có dữ liệu
        if (results.isEmpty()) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Không tìm thấy hóa đơn chi tiết với mã: " + maHoaDon);
        }

        // Xử lý dữ liệu và map vào DTO
        List<HoaDonChiTietDto> chiTietDtos = new ArrayList<>();
        for (Object[] row : results) {
            // Kiểm tra kiểu dữ liệu và ép kiểu chính xác
            String maSanPham = (String) row[0];
            String tenSanPham = (String) row[1];
            // Kiểm tra giá trị có null không trước khi ép kiểu
            Integer soLuong = row[3] != null ? ((Number) row[3]).intValue() : 0;
            String mauSac = (String) row[4];
            String size = (String) row[5];
            String anhUrl = (String) row[6];
            // Kiểm tra nếu giá trị không null trước khi ép kiểu cho giá trị số
            Double donGia = row[2] != null ? ((Number) row[2]).doubleValue() : 0.0;
            // Nếu ảnh tồn tại, thêm vào list, nếu không thì trả về list rỗng
            List<String> anhUrls = anhUrl != null ? List.of(anhUrl) : List.of();

            // Thêm vào danh sách DTO
            HoaDonChiTietDto hoaDonChiTietDto = new HoaDonChiTietDto(
                    maSanPham, tenSanPham, donGia, soLuong, mauSac, size, anhUrls
            );
            chiTietDtos.add(hoaDonChiTietDto);
        }

        return chiTietDtos;
    }

    @Override
    public List<HoaDonDto> getHoaDonChiTietDto(Integer idKhachHang,Integer trangThai) {
        List<Object[]> result = hoaDonChiTietRepository.getHoaDonByKhachHangAndTrangThai(idKhachHang,trangThai);
        List<HoaDonDto> hoaDonDtos = new ArrayList<>();


        for (Object[] row : result) {


            HoaDonDto hoaDonDto = new HoaDonDto();
            hoaDonDto.setIdHoaDon((Integer) row[0]);
            hoaDonDto.setMaHoaDon((String) row[1]);
            hoaDonDto.setTenNguoiNhan((String) row[2]);
            hoaDonDto.setSdtNguoiNhan((String) row[3]);
            hoaDonDto.setTrangThai((Integer) row[4]);
            hoaDonDto.setDiaChiNhanHang((String) row[5]);
            hoaDonDto.setTongTienThanhToan(row[6] != null ? (Double) row[6] : 0.0);
            hoaDonDto.setIdHoaDonChiTiet((Integer) row[7]);
            hoaDonDto.setMaSanPham((String) row[8]);
            hoaDonDto.setTenSanPham((String) row[9]);
            hoaDonDto.setSoLuong(row[10] != null ? (Integer) row[10] : 0);  // Kiểm tra nếu có dữ liệu
            hoaDonDto.setMauSac((String) row[11]);
            hoaDonDto.setSize((String) row[13]);
            hoaDonDto.setAnhUrl((String) row[14]);  // Kiểm tra nếu có ảnh
            hoaDonDto.setDonGia(row[12] != null ? (Double) row[12] : 0.0);
            hoaDonDtos.add(hoaDonDto);

        }
        return hoaDonDtos;
    }
    // Lấy hóa đơn với voucher, khách hàng và phương thức thanh toán
    public Optional<HoaDon> getHoaDonWithDetailsByMa(String ma) {
        return hoaDonRepository.findHoaDonWithDetailsByMa(ma);
    }


    @Override
    public HoaDon huyHoaDon(String maHoaDon,String ghiChu) {

        HoaDon hoaDon = hoaDonRepository.findByMa(maHoaDon)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Hóa đơn không tồn tại"));

        hoaDon.setTrangThai(5);
        hoaDon.setGhiChu(ghiChu);
        hoaDonRepository.save(hoaDon);

        return hoaDon; // Return the updated invoice
    }

    @Override
    public HoaDon tangTrangThaiHoaDon(Integer id) {
        Optional<HoaDon> optionalHoaDon = hoaDonRepository.findById(id);

        if (optionalHoaDon.isPresent()) {
            HoaDon hoaDon = optionalHoaDon.get();
            Integer trangThaiHienTai = hoaDon.getTrangThai();

            // Nếu trạng thái chưa là 4, tăng trạng thái và ghi lại ngày sửa
            if (trangThaiHienTai != null && trangThaiHienTai < 4) {
                hoaDon.setTrangThai(trangThaiHienTai + 1); // Tăng trạng thái (ví dụ: từ 1->2, từ 2->3...)
                hoaDon.setNgaySua(LocalDate.now());

                // Nếu trạng thái là 2, trừ số lượng sản phẩm và giảm số lượng voucher
                if (trangThaiHienTai == 1) {
                    // Lấy danh sách chi tiết hóa đơn từ HoaDonChiTietRepository
                    List<HoaDonChiTiet> hoaDonChiTietList = hoaDonChiTietRepository.findByHoaDonId(hoaDon.getId());

                    // Giảm số lượng sản phẩm trong chi tiết hóa đơn
                    for (HoaDonChiTiet hct : hoaDonChiTietList) {
                        SanPhamChiTiet spct = hct.getSanPhamChiTiet();
                        // Giảm số lượng sản phẩm theo số lượng của chi tiết hóa đơn
                        if (spct != null) {
                            spct.setSoLuong(spct.getSoLuong() - hct.getSoLuong());
                            sanPhamChiTietRepository.save(spct); // Lưu lại sự thay đổi trong kho
                        }
                    }

                    // Nếu có voucher, giảm số lượng voucher
                    if (hoaDon.getVoucher() != null) {
                        Voucher voucher = hoaDon.getVoucher();
                        voucher.setSoLuong(voucher.getSoLuong() - 1); // Giảm 1 voucher đã sử dụng
                        voucherRepository.save(voucher); // Lưu lại sự thay đổi của voucher
                    }
                }

                // Lưu lại hóa đơn đã cập nhật
                return hoaDonRepository.save(hoaDon);
            }

            // Nếu trạng thái đã là 4 thì trả lại hóa đơn không thay đổi
            return hoaDon;
        }

        return null; // Không tìm thấy hóa đơn
    }


}


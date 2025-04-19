package com.example.dreambackend.repositories;

import com.example.dreambackend.entities.HoaDon;
import com.example.dreambackend.requests.HoaDonSearchRequest;
import com.example.dreambackend.responses.*;
import jakarta.persistence.EntityManager;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.CrudRepository;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.text.SimpleDateFormat;
import java.time.LocalDate;
import java.time.ZoneId;
import java.util.Date;
import java.util.List;
import java.util.Optional;

@Repository
public interface HoaDonRepository extends CrudRepository<HoaDon, Integer> {

    @Query("SELECT new com.example.dreambackend.responses.ThongKeResponse(COUNT(h.id), SUM(h.tongTienThanhToan), COUNT(DISTINCT h.khachHang.id)) " +
            "FROM HoaDon h " +
            "WHERE (:startDate IS NULL OR h.ngayTao >= :startDate) " +
            "AND (:endDate IS NULL OR h.ngayTao <= :endDate) " +
            "AND h.trangThai IN (4, 7)")
    ThongKeResponse getTongQuan(LocalDate startDate, LocalDate endDate);

    @Query("SELECT new com.example.dreambackend.responses.ThongKeThangResponse(MONTH(h.ngayTao), SUM(h.tongTienThanhToan)) " +
            "FROM HoaDon h " +
            "WHERE YEAR(h.ngayTao) = YEAR(CURRENT_DATE) " +
            "AND h.trangThai IN (4, 7) " +
            "GROUP BY MONTH(h.ngayTao) " +
            "ORDER BY MONTH(h.ngayTao)")
    List<ThongKeThangResponse> getDoanhThuTungThang();

    @Query("SELECT YEAR(h.ngayTao) AS year, SUM(h.tongTienThanhToan) AS totalRevenue " +
            "FROM HoaDon h " +
            "WHERE h.trangThai IN (4, 7) " +
            "GROUP BY YEAR(h.ngayTao) " +
            "ORDER BY YEAR(h.ngayTao)")
    List<Object[]> getDoanhThuTungNam();

    @Query("SELECT new com.example.dreambackend.responses.ThongKeThangNayResponse(" +
            "DAY(h.ngayTao), SUM(h.tongTienThanhToan)) " +
            "FROM HoaDon h " +
            "WHERE MONTH(h.ngayTao) = MONTH(CURRENT_DATE) " +
            "AND YEAR(h.ngayTao) = YEAR(CURRENT_DATE) " +
            "AND h.trangThai IN (4, 7) " +
            "GROUP BY DAY(h.ngayTao) " +
            "ORDER BY DAY(h.ngayTao)")
    List<ThongKeThangNayResponse> getDoanhThuTungNgayTrongThang();
    // Truy vấn doanh thu hôm nay

    @Query("SELECT new com.example.dreambackend.responses.ThongKeHomNayResponse(" +
            "COUNT(h.id), SUM(h.tongTienThanhToan), COUNT(DISTINCT h.khachHang.id)) " +
            "FROM HoaDon h " +
            "WHERE h.ngayTao = CURRENT_DATE " +
            "AND h.trangThai IN (4, 7)")
    ThongKeHomNayResponse getDoanhThuHomNay();

    List<HoaDon> findAllByTrangThai(int i);

    Optional<HoaDon> findByMa(String ma);


    @Query("SELECT h FROM HoaDon h WHERE h.id = :id")
    Optional<HoaDon> huyHoaDon(@Param("id") Integer id);


    default List<HoaDonResponse> search(HoaDonSearchRequest searchRequest, EntityManager entityManager) {
        SimpleDateFormat sdf = new SimpleDateFormat("yyyy-MM-dd");
        StringBuilder sql = new StringBuilder();
        sql.append("""
                SELECT
                    hd.id,
                    hd.id_khach_hang idKhachHang,
                    hd.id_nhan_vien idNhanVien,
                    hd.id_voucher idVoucher,
                    hd.id_phuong_thuc_thanh_toan idPhuongThucThanhToan,
                    kh.ten AS tenKhachHang,
                    nv.ten AS tenNhanVien,
                    vc.ten AS tenVoucher,
                    vc.hinh_thuc_giam AS hinhThucGiam,
                    vc.gia_tri_giam AS giaTriGiam,
                    hd.ma AS maHoaDon,
                    hd.ten_nguoi_nhan AS tenNguoiNhan,
                    hd.sdt_nguoi_nhan AS sdtNguoiNhan,
                    hd.dia_chi_nhan_hang AS diaChiNhanHang,
                    hd.hinh_thuc_thanh_toan AS hinhThucThanhToan,
                    hd.phi_van_chuyen AS phiVanChuyen,
                    hd.tong_tien_truoc_voucher tongTienTruocVoucher,
                    hd.tong_tien_thanh_toan AS tongTienThanhToan,
                    hd.ngay_nhan_du_kien AS ngayNhanDuKien,
                    hd.ngay_sua AS ngaySua,
                    hd.ngay_tao AS ngayTao,
                    hd.trang_thai AS trangThai,
                    hd.ghi_chu AS ghiChu,
                    COUNT(1) OVER () AS totalRecords
                FROM hoa_don hd
                LEFT JOIN khach_hang kh ON kh.id = hd.id_khach_hang
                LEFT JOIN nhan_vien nv ON nv.id = hd.id_nhan_vien
                LEFT JOIN voucher vc ON vc.id = hd.id_voucher
                LEFT JOIN phuong_thuc_thanh_toan pttt ON pttt.id = hd.id_phuong_thuc_thanh_toan
                WHERE 1=1 AND hd.trang_thai IN (6,7,8)
                """);
        if (searchRequest.getMaHoaDon() != null && !searchRequest.getMaHoaDon().isEmpty()) {
            sql.append(" AND UPPER(hd.ma) LIKE UPPER(:maHoaDon)");
        }
        if (searchRequest.getTenKhachHang() != null && !searchRequest.getTenKhachHang().isEmpty()) {
            sql.append(" AND UPPER(kh.ten) LIKE UPPER(:tenKhachHang)");
        }
        if (searchRequest.getTenNhanVien() != null && !searchRequest.getTenNhanVien().isEmpty()) {
            sql.append(" AND UPPER(nv.ten) LIKE UPPER(:tenNhanVien)");
        }
        if (searchRequest.getNgayTaoFrom() != null) {
            sql.append(" AND CAST(hd.ngay_tao AS DATE) >= :ngayTaoFrom");
        }
        if (searchRequest.getNgayTaoTo() != null) {
            sql.append(" AND CAST(hd.ngay_tao AS DATE) <= :ngayTaoTo");
        }
        if (searchRequest.getNgaySuaFrom() != null) {
            sql.append(" AND CAST(hd.ngay_sua AS DATE) >= :ngaySuaFrom");
        }
        if (searchRequest.getNgaySuaTo() != null) {
            sql.append(" AND CAST(hd.ngay_sua AS DATE) <= :ngaySuaTo");
        }
        if(searchRequest.getSdtNguoiNhan() != null && !searchRequest.getSdtNguoiNhan().isEmpty()) {
            sql.append(" AND hd.sdt_nguoi_nhan LIKE :soDienThoai");
        }
        if (searchRequest.getListTrangThai() != null) {
            sql.append(" AND hd.trang_thai = :listTrangThai");
        }
//        if (searchRequest.getIdHoaDon() != null) {
//            sql.append(" AND UPPER(hd.id) LIKE UPPER(:idHoaDon)");
//        }

        sql.append(" ORDER BY hd.id DESC");
        jakarta.persistence.Query query = entityManager.createNativeQuery(sql.toString(), "HoaDonResponseMapping");

        if (searchRequest.getMaHoaDon() != null && !searchRequest.getMaHoaDon().isEmpty()) {
            query.setParameter("maHoaDon", "%" + searchRequest.getMaHoaDon() + "%");
        }
        if (searchRequest.getTenKhachHang() != null && !searchRequest.getTenKhachHang().isEmpty()) {
            query.setParameter("tenKhachHang", "%" + searchRequest.getTenKhachHang() + "%");
        }
        if (searchRequest.getTenNhanVien() != null && !searchRequest.getTenNhanVien().isEmpty()) {
            query.setParameter("tenNhanVien", "%" + searchRequest.getTenNhanVien() + "%");
        }
        if (searchRequest.getListTrangThai() != null) {
            query.setParameter("listTrangThai", searchRequest.getListTrangThai());
        }
        if (searchRequest.getNgayTaoFrom() != null) {
            Date dateFrom = Date.from(searchRequest.getNgayTaoFrom().atStartOfDay(ZoneId.systemDefault()).toInstant());
            query.setParameter("ngayTaoFrom", sdf.format(dateFrom));
        }
        if (searchRequest.getNgayTaoTo() != null) {
            Date dateTo = Date.from(searchRequest.getNgayTaoTo().atStartOfDay(ZoneId.systemDefault()).toInstant());
            query.setParameter("ngayTaoTo", sdf.format(dateTo));
        }
        if (searchRequest.getNgaySuaFrom() != null) {
            Date dateFrom = Date.from(searchRequest.getNgaySuaFrom().atStartOfDay(ZoneId.systemDefault()).toInstant());
            query.setParameter("ngaySuaFrom", sdf.format(dateFrom));
        }
        if (searchRequest.getNgaySuaTo() != null) {
            Date dateTo = Date.from(searchRequest.getNgaySuaTo().atStartOfDay(ZoneId.systemDefault()).toInstant());
            query.setParameter("ngaySuaTo", sdf.format(dateTo));
        }

        if(searchRequest.getSdtNguoiNhan() != null && !searchRequest.getSdtNguoiNhan().isEmpty()) {
            query.setParameter("soDienThoai","%" + searchRequest.getSdtNguoiNhan() + "%");
        }
//        if (searchRequest.getIdHoaDon() != null) {
//            query.setParameter("idHoaDon", "%" + searchRequest.getIdHoaDon() + "%");
//        }
        if (searchRequest.getPage() != null && searchRequest.getPageSize() != null) {
            query.setFirstResult((searchRequest.getPage() - 1) * searchRequest.getPageSize());
            query.setMaxResults(searchRequest.getPageSize());
        }

        List<HoaDonResponse> list = query.getResultList();
        if (list.isEmpty()) {
            searchRequest.setTotalRecords(0);
        } else {
            searchRequest.setTotalRecords(list.get(0).getTotalRecords());
        }
        return list;
    }

    // Lấy các trường cần thiết của hóa đơn với voucher, khách hàng và phương thức thanh toán
    @Query("SELECT h FROM HoaDon h " +
            "LEFT JOIN FETCH h.voucher " +
            "LEFT JOIN FETCH h.khachHang " +
            "LEFT JOIN FETCH h.phuongThucThanhToan " +
            "WHERE h.id = :id")
    Optional<HoaDon> findHoaDonWithDetailsByMa(Integer id);

    @Query("SELECT hd FROM HoaDon hd " +
            "JOIN FETCH hd.khachHang kh " +
            "JOIN FETCH hd.nhanVien nv " +
            "LEFT JOIN FETCH hd.voucher v " +
            "LEFT JOIN FETCH hd.phuongThucThanhToan ptt " +
            "WHERE hd.id = :idHoaDon")
    Optional<HoaDon> getHoaDonById(@Param("idHoaDon") Integer idHoaDon);


    @Query("SELECT h FROM HoaDon h WHERE h.trangThai IN (1, 2, 3, 4, 5) " +
            "AND (h.trangThai = ?1 OR ?1 = 0) " +  // Lọc trạng thái
            "AND (LOWER(h.tenNguoiNhan) LIKE LOWER(CONCAT('%', ?2, '%')) OR ?2 IS NULL) " +  // Lọc tên người nhận
            "AND (h.sdtNguoiNhan LIKE CONCAT('%', ?3, '%') OR ?3 IS NULL) " +  // Lọc số điện thoại người nhận
            "AND (h.ma LIKE CONCAT('%', ?4, '%') OR ?4 IS NULL)"+
            "ORDER BY h.id DESC")  // Lọc mã hóa đơn
    List<HoaDon> findByTrangThaiAndNguoiNhanAndMa(Integer trangThai, String tenNguoiNhan, String sdtNguoiNhan, String maHoaDon);

    List<HoaDon> findByTrangThai(Integer trangThai);

    boolean existsByVoucher_Id(Integer voucherId);
}

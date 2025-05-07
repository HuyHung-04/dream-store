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
            "WHERE (:startDate IS NULL OR " +
            "       ( (h.trangThai = 4 AND h.ngaySua >= :startDate) " +
            "         OR (h.trangThai = 7 AND h.ngayTao >= :startDate) )) " +
            "AND (:endDate IS NULL OR " +
            "     ( (h.trangThai = 4 AND h.ngaySua <= :endDate) " +
            "       OR (h.trangThai = 7 AND h.ngayTao <= :endDate) )) " +
            "AND h.trangThai IN (4, 7)")
    ThongKeResponse getTongQuan(
            @Param("startDate") LocalDate startDate,
            @Param("endDate") LocalDate endDate
    );

    @Query("SELECT new com.example.dreambackend.responses.ThongKeResponse(" +
            "COALESCE(COUNT(h.id), 0), " +
            "COALESCE(SUM(h.tongTienThanhToan), 0.0), " +
            "COALESCE(COUNT(DISTINCT h.khachHang.id), 0)) " +
            "FROM HoaDon h " +
            "WHERE (" +
            "   (:month = 0 " + // Nếu month = 0, lấy cả năm
            "       OR (h.trangThai = 4 AND MONTH(h.ngaySua) = :month) " +
            "       OR (h.trangThai = 7 AND MONTH(h.ngayTao) = :month) " +
            ") " +
            ") " +
            "AND (" +
            "   (h.trangThai = 4 AND YEAR(h.ngaySua) = :year) " +
            "   OR (h.trangThai = 7 AND YEAR(h.ngayTao) = :year) " +
            ") " +
            "AND h.trangThai IN (4, 7)")
    ThongKeResponse getTongQuanTheoThangVaNam(
            @Param("month") int month,
            @Param("year") int year
    );

    @Query("SELECT new com.example.dreambackend.responses.ThongKeThangResponse(" +
            "MONTH(CASE WHEN h.trangThai = 4 THEN h.ngaySua ELSE h.ngayTao END), " +
            "SUM(h.tongTienThanhToan)) " +
            "FROM HoaDon h " +
            "WHERE YEAR(CASE WHEN h.trangThai = 4 THEN h.ngaySua ELSE h.ngayTao END) = :year " +
            "AND h.trangThai IN (4, 7) " +
            "GROUP BY MONTH(CASE WHEN h.trangThai = 4 THEN h.ngaySua ELSE h.ngayTao END) " +
            "ORDER BY MONTH(CASE WHEN h.trangThai = 4 THEN h.ngaySua ELSE h.ngayTao END)")
    List<ThongKeThangResponse> getDoanhThuTungThangTheoNam(@Param("year") int year);

    @Query("SELECT YEAR(CASE WHEN h.trangThai = 4 THEN h.ngaySua ELSE h.ngayTao END) AS year, " +
            "SUM(h.tongTienThanhToan) AS totalRevenue " +
            "FROM HoaDon h " +
            "WHERE h.trangThai IN (4, 7) " +
            "GROUP BY YEAR(CASE WHEN h.trangThai = 4 THEN h.ngaySua ELSE h.ngayTao END) " +
            "ORDER BY YEAR(CASE WHEN h.trangThai = 4 THEN h.ngaySua ELSE h.ngayTao END)")
    List<Object[]> getDoanhThuTungNam();

    @Query("SELECT new com.example.dreambackend.responses.ThongKeThangNayResponse(" +
            "DAY(CASE WHEN h.trangThai = 4 THEN h.ngaySua ELSE h.ngayTao END), " +
            "SUM(h.tongTienThanhToan)) " +
            "FROM HoaDon h " +
            "WHERE MONTH(CASE WHEN h.trangThai = 4 THEN h.ngaySua ELSE h.ngayTao END) = :month " +
            "AND YEAR(CASE WHEN h.trangThai = 4 THEN h.ngaySua ELSE h.ngayTao END) = :year " +
            "AND h.trangThai IN (4, 7) " +
            "GROUP BY DAY(CASE WHEN h.trangThai = 4 THEN h.ngaySua ELSE h.ngayTao END) " +
            "ORDER BY DAY(CASE WHEN h.trangThai = 4 THEN h.ngaySua ELSE h.ngayTao END)")
    List<ThongKeThangNayResponse> getDoanhThuTheoNgayTheoThang(
            @Param("month") int month,
            @Param("year") int year
    );

    @Query("SELECT new com.example.dreambackend.responses.ThongKeHomNayResponse(" +
            "COUNT(h.id), SUM(h.tongTienThanhToan), COUNT(DISTINCT h.khachHang.id)) " +
            "FROM HoaDon h " +
            "WHERE (" +
            "   (h.trangThai = 4 AND CAST(h.ngaySua AS date) = CURRENT_DATE) " +
            "   OR (h.trangThai = 7 AND CAST(h.ngayTao AS date) = CURRENT_DATE) " +
            ") " +
            "AND h.trangThai IN (4, 7)")
    ThongKeHomNayResponse getDoanhThuHomNay();

    @Query("SELECT new com.example.dreambackend.responses.ThongKeResponse(" +
            "COUNT(h.id), SUM(h.tongTienThanhToan), COUNT(DISTINCT h.khachHang.id)) " +
            "FROM HoaDon h " +
            "WHERE h.trangThai IN (4, 7) " +
            "AND (:startDate IS NULL OR " +
            "   ( (h.trangThai = 4 AND h.ngaySua >= :startDate) " +
            "     OR (h.trangThai = 7 AND h.ngayTao >= :startDate) )) " +
            "AND (:endDate IS NULL OR " +
            "   ( (h.trangThai = 4 AND h.ngaySua <= :endDate) " +
            "     OR (h.trangThai = 7 AND h.ngayTao <= :endDate) ))")
    ThongKeResponse getThongKeTheoKhoangThoiGian(
            @Param("startDate") LocalDate startDate,
            @Param("endDate") LocalDate endDate
    );

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
                    hd.phi_van_chuyen AS phiVanChuyen,
                    hd.tong_tien_truoc_voucher tongTienTruocVoucher,
                    hd.tong_tien_thanh_toan AS tongTienThanhToan,
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


    @Query("SELECT h FROM HoaDon h WHERE h.trangThai IN (1, 2, 3, 4, 5, 9) " +
            "AND (:trangThai = 0 OR h.trangThai = :trangThai) " +
            "AND (:tenNguoiNhan = '' OR LOWER(h.tenNguoiNhan) LIKE LOWER(CONCAT('%', :tenNguoiNhan, '%'))) " +
            "AND (:sdtNguoiNhan = '' OR h.sdtNguoiNhan LIKE CONCAT('%', :sdtNguoiNhan, '%')) " +
            "AND (:maHoaDon = '' OR h.ma LIKE CONCAT('%', :maHoaDon, '%')) " +
            "ORDER BY h.id DESC")
    Page<HoaDon> findByTrangThaiAndNguoiNhanAndMa(
            @Param("trangThai") Integer trangThai,
            @Param("tenNguoiNhan") String tenNguoiNhan,
            @Param("sdtNguoiNhan") String sdtNguoiNhan,
            @Param("maHoaDon") String maHoaDon,
            Pageable pageable);

    List<HoaDon> findByTrangThai(Integer trangThai);

    boolean existsByVoucher_Id(Integer voucherId);
}

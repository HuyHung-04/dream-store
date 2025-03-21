package com.example.dreambackend.repositories;

import com.example.dreambackend.entities.HoaDon;
import com.example.dreambackend.entities.SanPhamChiTiet;
import com.example.dreambackend.requests.HoaDonChiTietSearchRequest;
import com.example.dreambackend.responses.HoaDonChiTietResponse;
import com.example.dreambackend.responses.TopSanPhamResponse;
import com.example.dreambackend.entities.HoaDonChiTiet;
import jakarta.persistence.EntityManager;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.CrudRepository;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.text.SimpleDateFormat;
import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

@Repository
public interface HoaDonChiTietRepository extends CrudRepository<HoaDonChiTiet, Integer> {

    // Top sản phẩm bán chạy nhất trong ngày hôm nay
    @Query("SELECT new com.example.dreambackend.responses.TopSanPhamResponse(sp.ten, SUM(hdct.soLuong)) " +
            "FROM HoaDonChiTiet hdct " +
            "JOIN hdct.sanPhamChiTiet spct " +
            "JOIN spct.sanPham sp " +
            "WHERE hdct.ngayTao = CURRENT_DATE " +
            "GROUP BY sp.ten " +
            "ORDER BY SUM(hdct.soLuong) DESC")
    Page<TopSanPhamResponse> getTopSanPhamHomNay(Pageable pageable);

    // Top sản phẩm bán chạy nhất trong tháng này
    @Query("SELECT new com.example.dreambackend.responses.TopSanPhamResponse(sp.ten, SUM(hdct.soLuong)) " +
            "FROM HoaDonChiTiet hdct " +
            "JOIN hdct.sanPhamChiTiet spct " +
            "JOIN spct.sanPham sp " +
            "WHERE hdct.ngayTao BETWEEN :startDate AND :endDate " +
            "GROUP BY sp.ten " +
            "ORDER BY SUM(hdct.soLuong) DESC")
    Page<TopSanPhamResponse> getTopSanPhamThangNay(Pageable pageable, LocalDate startDate, LocalDate endDate);

    // Top sản phẩm bán chạy nhất trong năm nay
    @Query("SELECT new com.example.dreambackend.responses.TopSanPhamResponse(sp.ten, SUM(hdct.soLuong)) " +
            "FROM HoaDonChiTiet hdct " +
            "JOIN hdct.sanPhamChiTiet spct " +
            "JOIN spct.sanPham sp " +
            "WHERE YEAR(hdct.ngayTao) = YEAR(CURRENT_DATE) " +
            "GROUP BY sp.ten " +
            "ORDER BY SUM(hdct.soLuong) DESC")
    Page<TopSanPhamResponse> getTopSanPhamNamNay(Pageable pageable);

    // Top sản phẩm bán chạy nhất tất cả thời gian
    @Query("SELECT new com.example.dreambackend.responses.TopSanPhamResponse(sp.ten, SUM(hdct.soLuong)) " +
            "FROM HoaDonChiTiet hdct " +
            "JOIN hdct.sanPhamChiTiet spct " +
            "JOIN spct.sanPham sp " +
            "GROUP BY sp.ten " +
            "ORDER BY SUM(hdct.soLuong) DESC")
    Page<TopSanPhamResponse> getTopSanPhamTatCa(Pageable pageable);

    List<HoaDonChiTiet> findByHoaDonId(int id);

    Optional<HoaDonChiTiet> findByHoaDonAndSanPhamChiTiet(HoaDon hoaDon, SanPhamChiTiet sanPhamChiTiet);

    List<HoaDonChiTiet> findByHoaDon(HoaDon hoaDon);

    default List<HoaDonChiTietResponse> search(HoaDonChiTietSearchRequest hoaDonChiTietSearchRequest, EntityManager entityManager) {
        SimpleDateFormat dateFormat = new SimpleDateFormat("yyyy-MM-dd");
        StringBuilder sb = new StringBuilder();
        sb.append("""
                SELECT
                	hdct.id,
                	hdct.id_hoa_don AS idHoaDon,
                	spct.id AS idSanPhamChiTiet,
                	spct.ma AS maSanPhamChiTiet,
                	hdct.ma AS maHoaDonChiTiet,
                	kh.ten AS tenKhachHang,
                	ms.ten AS tenMau,
                	sz.ten AS tenSize,
                	sp.ten AS tenSanPham,
                	hd.ma AS maHoaDon,
                	hdct.ngay_tao AS ngayTao,
                	hdct.ngay_sua AS ngaySua,
                	hdct.don_gia AS gia,
                	hdct.so_luong AS soLuong,
                	hdct.trang_thai AS trangThai,
                	km.hinh_thuc_giam AS hinhThucGiam,
                	km.gia_tri_giam AS giaTriGiam,
                	vc.ten AS tenVoucher,
                	vc.hinh_thuc_giam AS hinhThucGiam,
                	vc.gia_tri_giam AS giaTriGiam,
                	nv.ten AS tenNhanVien,
                	COUNT(1) OVER () AS totalRecords
                FROM hoa_don_chi_tiet hdct
                	LEFT JOIN hoa_don hd ON hd.id = hdct.id_hoa_don
                	LEFT JOIN san_pham_chi_tiet spct ON spct.id = hdct.id_san_pham_chi_tiet
                	LEFT JOIN san_pham sp ON spct.id_san_pham = sp.id
                	LEFT JOIN khach_hang kh ON kh.id = hd.id_khach_hang
                	LEFT JOIN mau_sac ms ON ms.id = spct.id_mau_sac
                	LEFT JOIN SIZE sz ON sz.id = spct.id_size
                	LEFT JOIN khuyen_mai km ON km.id = spct.id_khuyen_mai
                	LEFT JOIN voucher vc ON vc.id = hd.id_voucher
                	LEFT JOIN nhan_vien nv ON nv.id = hd.id_nhan_vien
                WHERE
                	1 = 1
                """);
        if (hoaDonChiTietSearchRequest.getIdHoaDon() != null) {
            sb.append(" AND hdct.id_hoa_don = :idHoaDon");
        }
        if (hoaDonChiTietSearchRequest.getMaHoaDon() != null && !hoaDonChiTietSearchRequest.getMaHoaDon().isEmpty()) {
            sb.append(" AND hd.ma = :maHoaDon");
        }
        if (hoaDonChiTietSearchRequest.getTenSanPham() != null && !hoaDonChiTietSearchRequest.getTenSanPham().isEmpty()) {
            sb.append(" AND UPPER(sp.ten) LIKE UPPER(:tenSanPham)");
        }
        if (hoaDonChiTietSearchRequest.getDonGia() != null) {
            sb.append(" AND hdct.don_gia = :donGia");
        }
        if (hoaDonChiTietSearchRequest.getNgayTaoTu() != null) {
            sb.append(" AND CAST(hdct.ngay_tao AS DATE) >= :ngayTaoTu");
        }
        if (hoaDonChiTietSearchRequest.getNgayTaoDen() != null) {
            sb.append(" AND CAST(hdct.ngay_tao AS DATE) <= :ngayTaoDen");
        }
        if (hoaDonChiTietSearchRequest.getNgaySuaTu() != null) {
            sb.append(" AND CAST(hdct.ngay_sua AS DATE) >= :ngaySuaTu");
        }
        if (hoaDonChiTietSearchRequest.getNgaySuaDen() != null) {
            sb.append(" AND CAST(hdct.ngay_sua AS DATE) <= :ngaySuaDen");
        }
        if (hoaDonChiTietSearchRequest.getTenKhachHang() != null && !hoaDonChiTietSearchRequest.getTenKhachHang().isEmpty()) {
            sb.append(" AND UPPER(kh.ten) LIKE UPPER(:tenKhachHang)");
        }
        if (hoaDonChiTietSearchRequest.getTenNhanVien() != null && !hoaDonChiTietSearchRequest.getTenNhanVien().isEmpty()) {
            sb.append(" AND UPPER(nv.ten) LIKE UPPER(:tenNhanVien)");
        }

        sb.append(" ORDER BY hdct.ngay_tao DESC, hdct.ngay_sua DESC");

        jakarta.persistence.Query query = entityManager.createNativeQuery(sb.toString(), "HoaDonChiTietResponseMapping");

        if (hoaDonChiTietSearchRequest.getPage() != null && hoaDonChiTietSearchRequest.getPageSize() != null) {
            query.setFirstResult((hoaDonChiTietSearchRequest.getPage() - 1) * hoaDonChiTietSearchRequest.getPageSize());
            query.setMaxResults(hoaDonChiTietSearchRequest.getPageSize());
        }
        if (hoaDonChiTietSearchRequest.getIdHoaDon() != null) {
            query.setParameter("idHoaDon", hoaDonChiTietSearchRequest.getIdHoaDon());
        }
        if (hoaDonChiTietSearchRequest.getMaHoaDon() != null && !hoaDonChiTietSearchRequest.getMaHoaDon().isEmpty()) {
            query.setParameter("maHoaDon", hoaDonChiTietSearchRequest.getMaHoaDon());
        }
        if (hoaDonChiTietSearchRequest.getTenSanPham() != null && !hoaDonChiTietSearchRequest.getTenSanPham().isEmpty()) {
            query.setParameter("tenSanPham", "%" + hoaDonChiTietSearchRequest.getTenSanPham() + "%");
        }
        if (hoaDonChiTietSearchRequest.getDonGia() != null && hoaDonChiTietSearchRequest.getDonGia() > 0) {
            query.setParameter("donGia", hoaDonChiTietSearchRequest.getDonGia());
        }
        if (hoaDonChiTietSearchRequest.getNgayTaoTu() != null) {
            query.setParameter("ngayTaoTu", dateFormat.format(hoaDonChiTietSearchRequest.getNgayTaoTu()));
        }
        if (hoaDonChiTietSearchRequest.getNgayTaoDen() != null) {
            query.setParameter("ngayTaoDen", dateFormat.format(hoaDonChiTietSearchRequest.getNgayTaoDen()));
        }
        if (hoaDonChiTietSearchRequest.getNgaySuaTu() != null) {
            query.setParameter("ngaySuaTu", dateFormat.format(hoaDonChiTietSearchRequest.getNgaySuaTu()));
        }
        if (hoaDonChiTietSearchRequest.getNgaySuaDen() != null) {
            query.setParameter("ngaySuaDen", dateFormat.format(hoaDonChiTietSearchRequest.getNgaySuaDen()));
        }
        if (hoaDonChiTietSearchRequest.getTenKhachHang() != null && !hoaDonChiTietSearchRequest.getTenKhachHang().isEmpty()) {
            query.setParameter("tenKhachHang", hoaDonChiTietSearchRequest.getTenKhachHang());
        }
        if (hoaDonChiTietSearchRequest.getTenNhanVien() != null && !hoaDonChiTietSearchRequest.getTenNhanVien().isEmpty()) {
            query.setParameter("tenNhanVien", hoaDonChiTietSearchRequest.getTenNhanVien());
        }
        List<HoaDonChiTietResponse> list = query.getResultList();
        if (list.isEmpty()) {
            hoaDonChiTietSearchRequest.setTotalRecords(0);
        } else {
            hoaDonChiTietSearchRequest.setTotalRecords(list.get(0).getTotalRecords());
        }
        return list;
    }

    Optional<HoaDonChiTiet> findBySanPhamChiTietId(Integer idSanPhamChiTiet);

    @Query(value = """
        SELECT 
            spct.ma AS maSanPham,
            sp.ten AS tenSanPham,
            hct.don_gia AS donGia,
            hct.so_luong AS soLuong,
            ms.ten AS mauSac,
            sz.ten AS size,
            (
                SELECT TOP 1 a.anh_url 
                FROM anh a 
                WHERE a.id_san_pham = sp.id AND a.trang_thai = 1
            ) AS anhUrl
        FROM hoa_don_chi_tiet hct
        JOIN san_pham_chi_tiet spct ON hct.id_san_pham_chi_tiet = spct.id
        JOIN san_pham sp ON spct.id_san_pham = sp.id
        JOIN mau_sac ms ON spct.id_mau_sac = ms.id
        JOIN size sz ON spct.id_size = sz.id
        JOIN hoa_don hd ON hct.id_hoa_don = hd.id
        WHERE hd.ma = :maHoaDon
    """, nativeQuery = true)
    List<Object[]> findChiTietByMaHoaDon(@Param("maHoaDon") String maHoaDon);


    @Query(value = """
    SELECT 
        hd.id AS idHoaDon,
        hd.ma AS maHoaDon,
        hd.tong_tien_thanh_toan AS tongTienThanhToan,
        hct.id AS idHoaDonChiTiet,
        spct.ma AS maSanPham,
        sp.ten AS tenSanPham,
        hct.so_luong AS soLuong,
        ms.ten AS mauSac,
        hct.don_gia AS donGia,
        sz.ten AS size,
        (
            SELECT TOP 1 a.anh_url
            FROM anh a
            WHERE a.id_san_pham = sp.id AND a.trang_thai = 1
        ) AS anhUrl
    FROM hoa_don hd
    JOIN hoa_don_chi_tiet hct ON hd.id = hct.id_hoa_don
    JOIN san_pham_chi_tiet spct ON hct.id_san_pham_chi_tiet = spct.id
    JOIN san_pham sp ON spct.id_san_pham = sp.id
    JOIN mau_sac ms ON spct.id_mau_sac = ms.id
    JOIN size sz ON spct.id_size = sz.id
    ORDER BY hd.id DESC  -- Sắp xếp hóa đơn theo id giảm dần
""", nativeQuery = true)
    List<Object[]> getHoaDonChiTiet();

    @Query("SELECT hdct FROM HoaDonChiTiet hdct " +
            "JOIN FETCH hdct.hoaDon hd " +
            "JOIN FETCH hdct.sanPhamChiTiet spct " +
            "JOIN FETCH spct.sanPham sp " +
            "JOIN FETCH spct.size " +         // Size thuộc spct
            "JOIN FETCH spct.mauSac " +       // Màu sắc thuộc spct
            "JOIN FETCH sp.chatLieu " +       // Chất liệu thuộc sp
            "JOIN FETCH sp.thuongHieu " +     // Thương hiệu thuộc sp
            "JOIN FETCH sp.coAo " +           // Cổ áo thuộc sp
            "JOIN FETCH sp.xuatXu " +         // Xuất xứ thuộc sp
            "WHERE hd.id = :idHoaDon")
    List<HoaDonChiTiet> getHoaDonChiTietByHoaDonId(@Param("idHoaDon") Integer idHoaDon);
}

package com.example.dreambackend.repositories;

import com.example.dreambackend.entities.HoaDon;
import com.example.dreambackend.entities.SanPhamChiTiet;
import com.example.dreambackend.responses.TopSanPhamResponse;
import com.example.dreambackend.entities.HoaDonChiTiet;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.CrudRepository;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

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



}

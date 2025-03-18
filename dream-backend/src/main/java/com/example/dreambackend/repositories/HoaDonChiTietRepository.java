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
                    hdct.id_hoa_don as idHoaDon,
                    spct.id as idSanPhamChiTiet,
                    spct.ma as maSanPhamChiTiet,
                    hdct.ma as maHoaDonChiTiet,
                    ms.ten as tenMau,
                    sz.ten as tenSize,
                	sp.ten as tenSanPham,
                    hd.ma as maHoaDon,
                    hdct.ngay_tao as ngayTao,
                    hdct.ngay_sua as ngaySua,
                    hdct.don_gia as gia,
                    hdct.so_luong as soLuong,
                    hdct.trang_thai as trangThai,
                    km.hinh_thuc_giam as hinhThucGiam,
                    km.gia_tri_giam as giaTriGiam,
                    COUNT(1) OVER () AS totalRecords
                FROM hoa_don_chi_tiet hdct
                LEFT JOIN hoa_don hd ON hd.id = hdct.id_hoa_don
                LEFT JOIN san_pham_chi_tiet spct ON spct.id = hdct.id_san_pham_chi_tiet
                LEFT JOIN san_pham sp ON spct.id_san_pham = sp.id
                LEFT JOIN mau_sac ms ON ms.id = spct.id_mau_sac
                LEFT JOIN size  sz ON sz.id = spct.id_size
                LEFT JOIN khuyen_mai km ON km.id = spct.id_khuyen_mai
                WHERE 1 = 1
                """);
        if (hoaDonChiTietSearchRequest.getIdHoaDon() != null) {
            sb.append(" AND hdct.id_hoa_don = :idHoaDon");
        }
        if (hoaDonChiTietSearchRequest.getMaHoaDon() != null && !hoaDonChiTietSearchRequest.getMaHoaDon().isEmpty()) {
            sb.append(" AND hd.ma = :maHoaDon");
        }
        if (hoaDonChiTietSearchRequest.getTenSanPham() != null && !hoaDonChiTietSearchRequest.getTenSanPham().isEmpty()) {
            sb.append(" AND UPPER(sp.ten) LIKE UPPeR(:tenSanPham)");
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
        List<HoaDonChiTietResponse> list = query.getResultList();
        if (list.isEmpty()) {
            hoaDonChiTietSearchRequest.setTotalRecords(0);
        } else {
            hoaDonChiTietSearchRequest.setTotalRecords(list.get(0).getTotalRecords());
        }
        return list;
    }

    Optional<HoaDonChiTiet> findBySanPhamChiTietId(Integer idSanPhamChiTiet);

}

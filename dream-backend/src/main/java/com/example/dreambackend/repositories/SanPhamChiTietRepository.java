package com.example.dreambackend.repositories;

import com.example.dreambackend.dtos.SanPhamChiTietDto;
import com.example.dreambackend.entities.MauSac;
import com.example.dreambackend.entities.SanPham;
import com.example.dreambackend.entities.SanPhamChiTiet;
import com.example.dreambackend.entities.Size;
import com.example.dreambackend.responses.GetSanPhamToBanHangRespone;
import com.example.dreambackend.responses.SanPhamChiTietRespone;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface SanPhamChiTietRepository extends JpaRepository<SanPhamChiTiet, Integer> {
    @Query("""
    select new com.example.dreambackend.responses.SanPhamChiTietRespone(
        spct.id,
        spct.ma,
        spct.gia,
        spct.soLuong,
        spct.ngayTao,
        spct.ngaySua,
        spct.trangThai,
        spct.sanPham.id,
        spct.sanPham.ten,
        spct.size.id,
        spct.size.ten,
        spct.mauSac.id,
        spct.mauSac.ten,
        CASE
            WHEN khuyenMai IS NOT NULL
                AND khuyenMai.trangThai = 1
                AND khuyenMai.ngayBatDau <= CURRENT_DATE
                AND khuyenMai.ngayKetThuc >= CURRENT_DATE
            THEN khuyenMai.ten
            ELSE NULL
        END,
        CASE
            WHEN khuyenMai IS NOT NULL
                AND khuyenMai.trangThai = 1
                AND khuyenMai.ngayBatDau <= CURRENT_DATE
                AND khuyenMai.ngayKetThuc >= CURRENT_DATE
            THEN CAST(spct.gia - (spct.gia * khuyenMai.giaTriGiam / 100) AS double)
            ELSE CAST(spct.gia AS double)
        END
    )
    from SanPhamChiTiet spct 
    LEFT JOIN spct.khuyenMai khuyenMai
    WHERE spct.sanPham.id = :idSanPham 
    ORDER BY spct.id DESC
""")
    Page<SanPhamChiTietRespone> getSanPhamChiTietBySanPhamId(@Param("idSanPham") Integer idSanPham, Pageable pageable);



    @Query("""
    select new com.example.dreambackend.responses.SanPhamChiTietRespone(
        spct.id,
        spct.ma,
        spct.gia,
        spct.soLuong,
        spct.ngayTao,
        spct.ngaySua,
        spct.trangThai,
        spct.sanPham.id,
        spct.sanPham.ten,
        spct.size.id,
        spct.size.ten,
        spct.mauSac.id,
        spct.mauSac.ten,
        khuyenMai.ten, 
        CASE
            WHEN khuyenMai IS NOT NULL
            THEN CAST(spct.gia - (spct.gia * khuyenMai.giaTriGiam / 100) AS double)
            ELSE CAST(spct.gia AS double)
        END
        ) 
    from SanPhamChiTiet spct 
    LEFT JOIN spct.khuyenMai khuyenMai
    WHERE spct.sanPham.id = :idSanPham 
      AND (:gia IS NULL OR spct.gia >= :gia)
      AND (:soLuong IS NULL OR spct.soLuong >= :soLuong)
      AND (:idMauSac IS NULL OR spct.mauSac.id = :idMauSac)
      AND (:idSize IS NULL OR spct.size.id = :idSize)
      AND (:trangThai IS NULL OR spct.trangThai = :trangThai)
    ORDER BY spct.id DESC
    """)
    Page<SanPhamChiTietRespone> timKiemSanPhamChiTiet(
            @Param("idSanPham") Integer idSanPham,
            @Param("gia") Double gia,
            @Param("soLuong") Integer soLuong,
            @Param("idMauSac") Integer idMauSac,
            @Param("idSize") Integer idSize,
            @Param("trangThai") Integer trangThai,
            Pageable pageable);



    @Query("""
    SELECT new com.example.dreambackend.dtos.SanPhamChiTietDto(
        spct.id,
        spct.ma,
        sp.ten,
        ms.ten,
        sz.ten,
        spct.gia,
        spct.soLuong,
        CASE WHEN spct.khuyenMai.id = :khuyenMaiId THEN true ELSE false END,
        CASE WHEN spct.khuyenMai.id IS NOT NULL AND spct.khuyenMai.id <> :khuyenMaiId THEN true ELSE false END
    )
    FROM SanPhamChiTiet spct
    JOIN spct.sanPham sp
    JOIN spct.mauSac ms
    JOIN spct.size sz
    WHERE spct.trangThai = 1 AND spct.soLuong > 0
    AND (:tenSanPham IS NULL OR LOWER(sp.ten) LIKE LOWER(CONCAT('%', :tenSanPham, '%')))
    ORDER BY spct.id DESC """)
    List<SanPhamChiTietDto> findAvailableProducts(@Param("tenSanPham") String tenSanPham, @Param("khuyenMaiId") Integer khuyenMaiId);
    List<SanPhamChiTiet> findAllByKhuyenMaiId(Integer khuyenMaiId);

    @Query("SELECT spct FROM SanPhamChiTiet spct WHERE spct.khuyenMai.id IN :khuyenMaiIds")
    List<SanPhamChiTiet> findAllByKhuyenMaiIdIn(@Param("khuyenMaiIds") List<Integer> khuyenMaiIds);

    List<SanPhamChiTiet> findBySanPhamId(Integer sanPhamId);
    boolean existsByMa(String ma);
    @Query("""
    SELECT new com.example.dreambackend.responses.GetSanPhamToBanHangRespone(
        spct.id,
        spct.ma,
        sp.ten,
        spct.gia,
        spct.soLuong,
        m.ten,
        s.ten,
        CASE
            WHEN km IS NOT NULL
                AND km.trangThai = 1
                AND km.ngayBatDau <= CURRENT_DATE
                AND km.ngayKetThuc >= CURRENT_DATE
            THEN km.giaTriGiam
            ELSE 0
        END,
        (SELECT a.anhUrl FROM Anh a WHERE a.sanPham.id = sp.id ORDER BY a.id ASC LIMIT 1)
    )
    FROM SanPhamChiTiet spct
    JOIN spct.sanPham sp
    JOIN spct.mauSac m
    JOIN spct.size s
    LEFT JOIN spct.khuyenMai km
    WHERE spct.soLuong > 0
      AND spct.trangThai = 1
    ORDER BY spct.id DESC
""")
    Page<GetSanPhamToBanHangRespone> getSanPhamForBanHang(Pageable pageable);


    @Query("SELECT new com.example.dreambackend.responses.GetSanPhamToBanHangRespone( "
            + "spct.id, spct.ma, sp.ten, spct.gia, spct.soLuong, "
            + "m.ten, s.ten, km.giaTriGiam, "
            + "(SELECT a.anhUrl FROM Anh a WHERE a.sanPham.id = sp.id ORDER BY a.id ASC LIMIT 1)) "
            + "FROM SanPhamChiTiet spct "
            + "JOIN spct.sanPham sp "
            + "JOIN spct.mauSac m "
            + "JOIN spct.size s "
            + "LEFT JOIN spct.khuyenMai km "
            + "WHERE spct.trangThai = 1"

            + "ORDER BY spct.id DESC")
    Page<GetSanPhamToBanHangRespone> getSanPhamForCheckBanHang(Pageable pageable);

    @Query("SELECT new com.example.dreambackend.responses.GetSanPhamToBanHangRespone( "
            + "spct.id, spct.ma, sp.ten, spct.gia, spct.soLuong, "
            + "m.ten, s.ten, km.giaTriGiam, "
            + "(SELECT a.anhUrl FROM Anh a WHERE a.sanPham.id = sp.id ORDER BY a.id ASC LIMIT 1)) "
            + "FROM SanPhamChiTiet spct "
            + "JOIN spct.sanPham sp "
            + "JOIN spct.mauSac m "
            + "JOIN spct.size s "
            + "LEFT JOIN spct.khuyenMai km "
            + "WHERE spct.soLuong > 0 and spct.trangThai = 1 "
            + "AND (km.trangThai = 1 OR km.trangThai IS NULL) "
            + "AND (:tenSanPham IS NULL OR LOWER(sp.ten) LIKE LOWER(CONCAT('%', :tenSanPham, '%'))) "
            + "AND (:mauSac IS NULL OR LOWER(m.ten) = LOWER(:mauSac)) "
            + "AND (:size IS NULL OR LOWER(s.ten) = LOWER(:size))"
            + "ORDER BY spct.id DESC")
    Page<GetSanPhamToBanHangRespone> searchSanPhamForBanHang(
            @Param("tenSanPham") String tenSanPham,
            @Param("mauSac") String mauSac,
            @Param("size") String size,
            Pageable pageable);

    //     check trùng spct khi thêm cùng màu và size
    Optional<SanPhamChiTiet> findBySanPhamAndSizeAndMauSac(SanPham sanPham, Size size, MauSac mauSac);

//    @Modifying
//    @Transactional
//    @Query("UPDATE SanPhamChiTiet spct SET spct.khuyenMai = null WHERE spct.khuyenMai.id = :khuyenMaiId")
//    void removeKhuyenMaiFromSanPhamChiTiet(@Param("khuyenMaiId") Integer khuyenMaiId);

    List<SanPhamChiTiet> findByKhuyenMaiId(Integer khuyenMaiId);

    List<SanPhamChiTiet> findAllByKhuyenMai_Id(Integer id);


}

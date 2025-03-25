package com.example.dreambackend.repositories;

import com.example.dreambackend.entities.SanPham;
import com.example.dreambackend.responses.SanPhamRespone;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

@Repository
public interface SanPhamRepository extends JpaRepository<SanPham, Integer> {
    @Query("""
    select new com.example.dreambackend.responses.SanPhamRespone(
            CAST(sp.id AS Integer),
            sp.ma,
            sp.ten,
            sp.ngayTao,
            sp.ngaySua,
            sp.trangThai,
            sp.chatLieu.id,
            sp.chatLieu.ten,
            sp.thuongHieu.id,
            sp.thuongHieu.ten,
            sp.coAo.id,
            sp.coAo.ten,
            sp.xuatXu.id,
            sp.xuatXu.ten,
            COALESCE(CAST(MAX(spct.gia) AS Double), 0.0),
            COALESCE(CAST(SUM(spct.soLuong) AS Integer), 0)
        ) 
    from SanPham sp 
    left join SanPhamChiTiet spct on sp.id = spct.sanPham.id
    group by sp.id, sp.ma, sp.ten, sp.ngayTao, sp.ngaySua, sp.trangThai,
             sp.chatLieu.id, sp.chatLieu.ten,
             sp.thuongHieu.id, sp.thuongHieu.ten,
             sp.coAo.id, sp.coAo.ten,
             sp.xuatXu.id, sp.xuatXu.ten
    ORDER BY sp.id DESC
""")
    Page<SanPhamRespone> getAllSanPhamRepone(Pageable pageable);




    @Query("""
        select new com.example.dreambackend.responses.SanPhamRespone(
        CAST(sp.id AS Integer),
        sp.ma,
        sp.ten,
        sp.ngayTao,
        sp.ngaySua,
        sp.trangThai,
        sp.chatLieu.id,
        sp.chatLieu.ten,
        sp.thuongHieu.id,
        sp.thuongHieu.ten,
        sp.coAo.id,
        sp.coAo.ten,
        sp.xuatXu.id,
        sp.xuatXu.ten,
        COALESCE(CAST(MAX(spct.gia) AS Double), 0.0),
        COALESCE(CAST(SUM(spct.soLuong) AS Integer), 0)
    )\s
    from SanPham sp\s
    left join SanPhamChiTiet spct on sp.id = spct.sanPham.id
    where (:thuongHieuId is null or sp.thuongHieu.id = :thuongHieuId)
        and (:xuatXuId is null or sp.xuatXu.id = :xuatXuId)
        and (:chatLieuId is null or sp.chatLieu.id = :chatLieuId)
        and (:coAoId is null or sp.coAo.id = :coAoId)
        and (:trangThai is null or sp.trangThai = :trangThai)
        and (:ten IS NULL OR LOWER(sp.ten) LIKE LOWER(CONCAT('%', :ten, '%')))
    group by sp.id, sp.ma, sp.ten, sp.ngayTao, sp.ngaySua, sp.trangThai,
             sp.chatLieu.id, sp.chatLieu.ten,
             sp.thuongHieu.id, sp.thuongHieu.ten,
             sp.coAo.id, sp.coAo.ten,
             sp.xuatXu.id, sp.xuatXu.ten
    ORDER BY sp.id DESC
    """)
    Page<SanPhamRespone> searchSanPham(
            @Param("thuongHieuId") Integer thuongHieuId,
            @Param("xuatXuId") Integer xuatXuId,
            @Param("chatLieuId") Integer chatLieuId,
            @Param("coAoId") Integer coAoId,
            @Param("trangThai") Integer trangThai,
            @Param("ten") String ten,
            Pageable pageable
    );

    boolean existsByMa(String ma);

    boolean existsByTen(String ten);
}

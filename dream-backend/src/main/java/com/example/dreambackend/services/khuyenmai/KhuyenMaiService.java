package com.example.dreambackend.services.khuyenmai;

import com.example.dreambackend.dtos.KhuyenMaiChiTietDto;
import com.example.dreambackend.dtos.SanPhamChiTietDto;
import com.example.dreambackend.dtos.SanPhamChiTietViewDto;
import com.example.dreambackend.entities.KhuyenMai;
import com.example.dreambackend.entities.SanPhamChiTiet;
import com.example.dreambackend.repositories.KhuyenMaiRepository;
import com.example.dreambackend.repositories.SanPhamChiTietRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.util.List;
@Service
public class KhuyenMaiService implements IKhuyenMaiService{
    @Autowired
    KhuyenMaiRepository khuyenMaiRepository;
    @Autowired
    SanPhamChiTietRepository sanPhamChiTietRepository;
    @Override
    public Page<KhuyenMai> getAllKhuyenMaiPaged(int page, int size) {
        Pageable pageable = PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "id"));
        Page<KhuyenMai> khuyenMais = khuyenMaiRepository.findAll(pageable);
        // Đảm bảo các sản phẩm của khuyến mãi hết hạn có idKhuyenMai = null trước khi chọn sản phẩm mới
        resetExpiredKhuyenMaiProducts();
        // Kiểm tra và cập nhật trạng thái khuyến mãi nếu cần
        khuyenMais.getContent().forEach(this::checkAndUpdateStatus);
        return khuyenMais;
    }

//    khuyenMais.getContent().forEach(khuyenMai -> {
//        checkAndUpdateStatus(khuyenMai);
//        if (khuyenMai.getTrangThai() == 0) { // Nếu khuyến mãi không hoạt động
//            sanPhamChiTietRepository.removeKhuyenMaiFromSanPhamChiTiet(khuyenMai.getId());
//        }

    @Override
    public KhuyenMai addKhuyenMai(KhuyenMai khuyenMai) {
        khuyenMai.setNgayTao(LocalDate.now());
        return khuyenMaiRepository.save(khuyenMai);
    }

    @Override
    public KhuyenMai updateKhuyenMai(KhuyenMai khuyenMai) {
        khuyenMai.setNgaySua(LocalDate.now());
        return khuyenMaiRepository.save(khuyenMai);
    }

    @Override
    public KhuyenMaiChiTietDto getKhuyenMaiById(Integer khuyenMaiId) {
        KhuyenMai khuyenMai = khuyenMaiRepository.findById(khuyenMaiId)
                .orElseThrow(() -> new IllegalArgumentException("Không tìm thấy khuyến mãi với id: " + khuyenMaiId));

        List<SanPhamChiTietViewDto> dtoList;

        List<SanPhamChiTiet> chiTietList = sanPhamChiTietRepository.findByKhuyenMaiId(khuyenMaiId);
        dtoList = chiTietList.stream()
                .map(spct -> new SanPhamChiTietViewDto(
                        spct.getMa(),
                        spct.getSanPham() != null ? spct.getSanPham().getTen() : "Không có tên",
                        spct.getMauSac() != null ? spct.getMauSac().getTen() : "Không có màu",
                        spct.getSize() != null ? spct.getSize().getTen() : "Không có size",
                        spct.getSoLuong()
                ))
                .toList();

        return new KhuyenMaiChiTietDto(khuyenMai, dtoList);
    }

    @Override
    public List<SanPhamChiTietDto> findAvailableProducts(String tenSanPham, Integer khuyenMaiId) {


        // Gọi phương thức với tham số tìm kiếm theo tên (nếu có)
        return sanPhamChiTietRepository.findAvailableProducts(tenSanPham, khuyenMaiId);
    }

    @Override
    public void updateKhuyenMaiProducts(Integer khuyenMaiId, List<Integer> productIds) {

        // Lấy khuyến mãi hiện tại
        KhuyenMai khuyenMai = khuyenMaiRepository.findById(khuyenMaiId)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy khuyến mãi với ID: " + khuyenMaiId));
        // Loại bỏ tất cả sản phẩm hiện tại liên kết với khuyến mãi
        List<SanPhamChiTiet> existingProducts = sanPhamChiTietRepository.findAllByKhuyenMaiId(khuyenMaiId);
        for (SanPhamChiTiet spct : existingProducts) {
            spct.setKhuyenMai(null);
        }
        sanPhamChiTietRepository.saveAll(existingProducts);
        // Liên kết các sản phẩm mới
        List<SanPhamChiTiet> newProducts = sanPhamChiTietRepository.findAllById(productIds);
        for (SanPhamChiTiet spct : newProducts) {
            spct.setKhuyenMai(khuyenMai);
        }
        sanPhamChiTietRepository.saveAll(newProducts);
    }

    private void resetExpiredKhuyenMaiProducts() {
        LocalDate today = LocalDate.now();

        // Lấy danh sách khuyến mãi đã hết hạn
        List<Integer> expiredKhuyenMaiIds = khuyenMaiRepository.findAll().stream()
                .filter(km -> km.getNgayKetThuc() != null && km.getNgayKetThuc().isBefore(today))
                .map(KhuyenMai::getId)
                .toList();

        if (!expiredKhuyenMaiIds.isEmpty()) {
            // Lấy danh sách sản phẩm có khuyến mãi hết hạn
            List<SanPhamChiTiet> affectedProducts = sanPhamChiTietRepository.findAllByKhuyenMaiIdIn(expiredKhuyenMaiIds);

            // Đặt idKhuyenMai của sản phẩm về null
            affectedProducts.forEach(spct -> spct.setKhuyenMai(null));

            // Cập nhật danh sách sản phẩm trong database
            sanPhamChiTietRepository.saveAll(affectedProducts);
        }
    }
    @Override
    public Page<KhuyenMai> getAllKhuyenMaiByTenAndTrangThai(int trangThai, String ten, int page, int size) {
        Pageable pageable = PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "id"));
        return khuyenMaiRepository.findByTrangThaiAndTenContainingIgnoreCase(trangThai,ten, pageable);
    }

    private void checkAndUpdateStatus(KhuyenMai khuyenMai) {
        if (khuyenMai.getNgayKetThuc() != null && khuyenMai.getNgayKetThuc().isBefore(LocalDate.now())) {
            if (khuyenMai.getTrangThai() != 0) { // Tránh cập nhật không cần thiết
                khuyenMai.setTrangThai(0); // 0 = Không hoạt động
                khuyenMaiRepository.save(khuyenMai); // Lưu thay đổi vào database
            }
        }
    }
}

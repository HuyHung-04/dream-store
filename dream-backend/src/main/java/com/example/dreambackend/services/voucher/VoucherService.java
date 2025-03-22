package com.example.dreambackend.services.voucher;

import com.example.dreambackend.entities.KhuyenMai;
import com.example.dreambackend.entities.ThuongHieu;
import com.example.dreambackend.entities.Voucher;
import com.example.dreambackend.repositories.ThuongHieuRepository;
import com.example.dreambackend.repositories.VoucherRepository;

import jakarta.transaction.Transactional;

import org.springframework.beans.BeanUtils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;

import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class VoucherService implements IVoucherService {
    @Autowired
    VoucherRepository voucherRepository;
    @Override
    public Page<Voucher> getAllVoucherPaged(int page, int size) {
        Pageable pageable = PageRequest.of(page, size);
        Page<Voucher> vouchers = voucherRepository.findAll(pageable);
        // Cập nhật trạng thái nếu ngày kết thúc đã qua
        vouchers.getContent().forEach(this::checkAndUpdateStatus);
        return vouchers;
    }

    @Override
    public Voucher addVoucher(Voucher voucher) {

        voucher.setNgayTao(LocalDate.now());
        return voucherRepository.save(voucher);
    }
    @Override
    public Voucher updateVoucher( Voucher voucher) {
        voucher.setNgaySua(LocalDate.now());
        return voucherRepository.save(voucher);
    }
    @Override
    public Voucher getVoucherById(Integer id) {
        return voucherRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Voucher không tồn tại với id: " + id));
    }
    public List<Voucher> searchVoucherByName(String ten) {
        return voucherRepository.findByTenContainingIgnoreCase(ten);
    }

    private void checkAndUpdateStatus(Voucher voucher) {
        if (voucher.getNgayKetThuc() != null && voucher.getNgayKetThuc().isBefore(LocalDate.now())) {
            if (voucher.getTrangThai() != 0) { // Tránh cập nhật không cần thiết
                voucher.setTrangThai(0); // 0 = Không hoạt động
                voucherRepository.save(voucher); // Lưu thay đổi vào database
            }
        }
    }
    @Override
    public Page<Voucher> getAllVoucherByTrangThai(int trangThai, int page, int size) {
        Pageable pageable = PageRequest.of(page, size);

        return voucherRepository.findVoucherByTrangThai(trangThai, pageable);
    }

}

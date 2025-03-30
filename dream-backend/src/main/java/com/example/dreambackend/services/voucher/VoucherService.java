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
        boolean updated = false;

        // Kiểm tra null trước khi so sánh
        if (voucher.getSoLuong() != null && voucher.getSoLuong() == 0 && voucher.getTrangThai() != 0) {
            voucher.setTrangThai(0);
            updated = true;
        }

        if (voucher.getNgayKetThuc() != null && voucher.getNgayKetThuc().isBefore(LocalDate.now())
                && voucher.getTrangThai() != 0) {
            voucher.setTrangThai(0);
            updated = true;
        }

        if (updated) {
            voucherRepository.save(voucher);
        }
    }
    @Override
    public Page<Voucher> getAllVoucherByTrangThai(int trangThai, int page, int size) {
        Pageable pageable = PageRequest.of(page, size);

        return voucherRepository.findVoucherByTrangThai(trangThai, pageable);
    }

}

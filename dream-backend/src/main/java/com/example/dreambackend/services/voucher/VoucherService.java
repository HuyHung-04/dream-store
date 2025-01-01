package com.example.dreambackend.services.voucher;

import com.example.dreambackend.entities.ThuongHieu;
import com.example.dreambackend.entities.Voucher;
import com.example.dreambackend.repositories.ThuongHieuRepository;
import com.example.dreambackend.repositories.VoucherRepository;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class VoucherService implements IVoucherService {
    @Autowired
    VoucherRepository voucherRepository;
    @Override
    public List<Voucher> getAllVoucher() {
        return voucherRepository.findAll();
    }

    @Override
    public Voucher addVoucher(Voucher voucher) {
        return voucherRepository.save(voucher);
    }
    @Override
    public Voucher updateVoucher(Voucher voucher) {
        return voucherRepository.save(voucher);
    }
    @Override
    public Voucher getVoucherById(Integer id) {
        return voucherRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Voucher không tồn tại với id: " + id));
    }
}

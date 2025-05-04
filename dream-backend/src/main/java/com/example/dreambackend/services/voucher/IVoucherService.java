package com.example.dreambackend.services.voucher;

import com.example.dreambackend.entities.Voucher;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;


import java.util.List;

public interface IVoucherService {
    Page<Voucher> getAllVoucherPaged(int page, int size);
    Voucher addVoucher(Voucher voucher);
    Voucher updateVoucher(Voucher voucher);
    Voucher getVoucherById(Integer id);
    Page<Voucher> getAllVoucherByTenAndTrangThai(int trangThai, String ten, int page, int size);
}

package com.example.dreambackend.services.voucher;

import com.example.dreambackend.entities.Voucher;
import org.springframework.data.domain.Page;


import java.util.List;

public interface IVoucherService {
    Page<Voucher> getAllVoucherPaged(int page, int size);
    Voucher addVoucher(Voucher voucher);
    Voucher updateVoucher(Voucher voucher);
    Voucher getVoucherById(Integer id);
    List<Voucher> searchVoucherByName(String ten);
    Page<Voucher> getAllVoucherByTrangThai(int trangThai, int page, int size);
}

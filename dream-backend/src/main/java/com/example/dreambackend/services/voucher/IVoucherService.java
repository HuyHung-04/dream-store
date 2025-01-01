package com.example.dreambackend.services.voucher;

import com.example.dreambackend.entities.Voucher;


import java.util.List;

public interface IVoucherService {
    List<Voucher> getAllVoucher();
    Voucher addVoucher(Voucher voucher);
    Voucher updateVoucher(Voucher voucher);
    Voucher getVoucherById(Integer id);
}

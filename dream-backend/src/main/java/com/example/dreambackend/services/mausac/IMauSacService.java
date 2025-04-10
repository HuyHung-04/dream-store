package com.example.dreambackend.services.mausac;

import com.example.dreambackend.entities.MauSac;
import com.example.dreambackend.requests.MauSacRequest;
import com.example.dreambackend.responses.MauSacRepone;

import java.util.List;

public interface IMauSacService {
    List<MauSacRepone> getAllMauSac();

    MauSac getMauSacById(Integer id);

    MauSac addMauSac(MauSacRequest mauSacRequest);

    MauSac updateTrangThaiMauSac(MauSacRequest request);
}

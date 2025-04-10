package com.example.dreambackend.services.size;

import com.example.dreambackend.entities.Size;
import com.example.dreambackend.requests.SizeRequest;
import com.example.dreambackend.responses.SizeRespone;

import java.util.List;

public interface ISizeService {
    List<SizeRespone> getAllSize();

    Size addSize(SizeRequest sizeRequest);

    Size updateTrangThaiSize(SizeRequest request);

    Size getSize(Integer id);
}

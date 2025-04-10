package com.example.dreambackend.services.coao;

import com.example.dreambackend.entities.CoAo;
import com.example.dreambackend.requests.CoAoRequest;
import com.example.dreambackend.responses.CoAoRespone;

import java.util.List;

public interface ICoAoService {
    List<CoAoRespone> getAllCoAo();

    CoAo getCoAoById(Integer id);

    CoAo addCoAo(CoAoRequest coAoRequest);

    CoAo updateTrangThaiCoAo(CoAoRequest request);
}

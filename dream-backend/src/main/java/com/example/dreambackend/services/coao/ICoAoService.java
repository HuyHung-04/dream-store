package com.example.dreambackend.services.coao;

import com.example.dreambackend.dtos.CoAoDto;
import com.example.dreambackend.entities.CoAo;

import java.util.List;

public interface ICoAoService {
    List<CoAo> getAllCoAo();

    CoAo getCoAoById(Integer idCoAo);

    CoAo addCoAo(CoAoDto coAoDto);

    CoAo updateCoAo(Integer idCoAo, CoAoDto coAoDto);
}

package com.example.dreambackend.services.sanphamchitiet;

import com.example.dreambackend.dtos.SanPhamChiTietDTO;
import com.example.dreambackend.entities.SanPhamChiTiet;
import com.example.dreambackend.repository.SanPhamChiTietRepository;
import com.example.dreambackend.repository.SanPhamRepository;
import org.modelmapper.ModelMapper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;


@Service
public class SanPhamChiTietService implements ISanPhamChiTietService {

    @Autowired
    private SanPhamRepository sanPhamRepository;

    @Autowired
    private SanPhamChiTietRepository sanPhamChiTietRepository;

    @Autowired
    private ModelMapper modelMapper;

    public SanPhamChiTietDTO convertToDTO(SanPhamChiTiet sanPhamChiTiet) {
        return modelMapper.map(sanPhamChiTiet, SanPhamChiTietDTO.class);
    }

    public SanPhamChiTiet convertToEntity(SanPhamChiTietDTO sanPhamChiTietDTO) {
        return modelMapper.map(sanPhamChiTietDTO, SanPhamChiTiet.class);
    }

    @Override
    public List<SanPhamChiTiet> getAllSanPhamChiTiet() {
        return sanPhamChiTietRepository.findAll();
    }
}

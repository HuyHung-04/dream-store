package org.example.dreambackend.services.sanphamchitiet;

import org.example.dreambackend.dtos.SanPhamChiTietDTO;
import org.example.dreambackend.entities.SanPhamChiTiet;
import org.example.dreambackend.repository.SanPhamChiTietRepository;
import org.modelmapper.ModelMapper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class SanPhamChiTietService implements ISanPhamChiTietService {

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
    public List<SanPhamChiTietDTO> getAllSanPhamChiTiet() {
        return sanPhamChiTietRepository.findAll()
                .stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }
}

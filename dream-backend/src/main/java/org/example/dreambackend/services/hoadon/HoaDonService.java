package org.example.dreambackend.services.hoadon;

import org.example.dreambackend.dtos.HoaDonDTO;
import org.example.dreambackend.entities.HoaDon;
import org.example.dreambackend.repository.HoaDonRepository;
import org.modelmapper.ModelMapper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
public class HoaDonService implements IHoaDonService {

    @Autowired
    private HoaDonRepository hoaDonRepository;

    @Autowired
    private ModelMapper modelMapper;

    public HoaDonDTO convertToDTO(HoaDon hoaDon) {
        return modelMapper.map(hoaDon, HoaDonDTO.class);
    }

    public HoaDon convertToEntity(HoaDonDTO hoaDonDTO) {
        return modelMapper.map(hoaDonDTO, HoaDon.class);
    }

    @Override
    public HoaDonDTO getHoaDonById(int id) {
        Optional<HoaDon> optionalHoaDon = hoaDonRepository.findById(id);
        return optionalHoaDon.map(this::convertToDTO)
                .orElseThrow(() -> new RuntimeException("HoaDon not found with ID: " + id));
    }

    @Override
    public HoaDon createHoaDon(HoaDonDTO hoaDonDTO) {
        HoaDon hoaDon = convertToEntity(hoaDonDTO);
        return hoaDonRepository.save(hoaDon);
    }

    @Override
    public List<HoaDonDTO> getListHoaDon() {
        return hoaDonRepository.findAll()
                .stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }
}

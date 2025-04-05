package com.example.dreambackend.services.jwt;

import com.example.dreambackend.entities.VaiTro;
import com.example.dreambackend.repositories.VaiTroRepository;
import com.example.dreambackend.security.ERole;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.Optional;

@Service
public class RoleService {
    @Autowired
    VaiTroRepository vaiTroRepository;

    public Optional<VaiTro> findByName(ERole name) {
        return vaiTroRepository.findByTen(String.valueOf(name));
    }
} 
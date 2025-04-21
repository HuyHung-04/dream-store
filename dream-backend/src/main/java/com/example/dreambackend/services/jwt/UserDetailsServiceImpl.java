package com.example.dreambackend.services.jwt;

import com.example.dreambackend.entities.NhanVien;
import com.example.dreambackend.repositories.NhanVienRepository;
import com.example.dreambackend.security.InactiveUserException;
import com.example.dreambackend.security.UserDetailsImpl;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class UserDetailsServiceImpl implements UserDetailsService {
    private static final Logger logger = LoggerFactory.getLogger(UserDetailsServiceImpl.class);

    @Autowired
    private NhanVienRepository nhanVienRepository;

    @Override
    @Transactional
    public UserDetails loadUserByUsername(String login) throws UsernameNotFoundException {
        NhanVien nhanVien = nhanVienRepository.findByTaiKhoan(login)
                .orElseGet(() -> nhanVienRepository.findByEmail(login)
                        .orElseThrow(() -> new UsernameNotFoundException("User Not Found with username/email: " + login)));


        if (nhanVien.getTrangThai() != 1 ) {
            throw new InactiveUserException("Nhân viên không hoạt động");
        }

        String roleName = nhanVien.getVaiTro().getTen();
        logger.debug("Role name from database: '{}'", roleName);

        // Sử dụng role name gốc từ database
        List<GrantedAuthority> authorities = List.of(new SimpleGrantedAuthority("ROLE_" + roleName));
        logger.debug("Authorities: {}", authorities);

        return new UserDetailsImpl(
                nhanVien.getId(),
                nhanVien.getTaiKhoan(),
                nhanVien.getEmail(),
                nhanVien.getMatKhau(),
                authorities
        );
    }
} 
package com.example.dreambackend.services.jwt;

import com.example.dreambackend.entities.NhanVien;
import com.example.dreambackend.repositories.NhanVienRepository;
import com.example.dreambackend.security.UserDetailsImpl;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class UserDetailsServiceImpl implements UserDetailsService {

    @Autowired
    private NhanVienRepository nhanVienRepository;

    @Override
    @Transactional
    public UserDetails loadUserByUsername(String login) throws UsernameNotFoundException {
        NhanVien nhanVien = nhanVienRepository.findByTaiKhoan(login)
                .orElseGet(() -> nhanVienRepository.findByEmail(login)
                        .orElseThrow(() -> new UsernameNotFoundException("User Not Found with username/email: " + login)));

        // Tạo danh sách authorities từ vai trò của nhân viên
        String roleName = nhanVien.getVaiTro().getTen();
        // Chuyển đổi tên vai trò thành định dạng ROLE_XXX
        String authority = "ROLE_" + roleName.toUpperCase().replace(" ", "_");
        List<GrantedAuthority> authorities = List.of(new SimpleGrantedAuthority(authority));

        return new UserDetailsImpl(
                nhanVien.getId(),
                nhanVien.getTaiKhoan(),
                nhanVien.getEmail(),
                nhanVien.getMatKhau(),
                authorities
        );
    }
} 
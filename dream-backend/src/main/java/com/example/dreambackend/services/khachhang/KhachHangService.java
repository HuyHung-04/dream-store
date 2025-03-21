package com.example.dreambackend.services.khachhang;

import com.example.dreambackend.dtos.KhachHangBanHangDto;
import com.example.dreambackend.dtos.KhachHangDto;
import com.example.dreambackend.entities.KhachHang;

import com.example.dreambackend.repositories.KhachHangRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.mail.MailException;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;

import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.time.LocalDate;
import java.util.Base64;
import java.util.List;
import java.util.Optional;
import java.util.Random;

@Service
public class KhachHangService implements IKhachHangService{
    @Autowired
    private KhachHangRepository khachHangRepository;

    @Autowired
    private JavaMailSender mailSender;

    @Override
    public Page<KhachHang> getAllKhachHangPaged(int page, int size) {
        Pageable pageable = PageRequest.of(page, size);
        Page<KhachHang> khachhangs = khachHangRepository.findAll(pageable);

        return khachhangs;
    }
    public Optional<KhachHangBanHangDto> getKhachHangBySoDienThoai(String soDienThoai) {
        return khachHangRepository.findBySoDienThoai(soDienThoai)
                .map(kh -> new KhachHangBanHangDto(kh.getId(), kh.getTen(), kh.getSoDienThoai()));
    }


    @Override
    public KhachHang getKhachHangById(Integer id) {
        return khachHangRepository.findById(id).orElseThrow(()
                -> new RuntimeException("Không tim được id cua khach hang"));
    }
    @Override
    public KhachHang addKhachHang(KhachHangDto khachHangDto) {

        KhachHang newKhachHang = KhachHang.builder()
                .ten(khachHangDto.getTen())
                .gioiTinh(khachHangDto.isGioiTinh())
                .email(khachHangDto.getEmail())
                .soDienThoai(khachHangDto.getSoDienThoai())
                .matKhau(khachHangDto.getMatKhau())
                .ngayTao(LocalDate.now())
                .trangThai(1)
                .build();

        try {
            SimpleMailMessage message = new SimpleMailMessage();
            message.setTo(khachHangDto.getEmail());
            message.setSubject("Bạn đã đăng ký tài khoản thành công");
            message.setText("Cảm ơn bạn đã đăng ký tài khoản tại hệ thống của chúng tôi!");

            mailSender.send(message);
        } catch (MailException e) {
            System.err.println("Lỗi gửi email: " + e.getMessage());
            // Không throw lỗi để tránh làm hỏng quá trình đăng ký
        }

        return  khachHangRepository.save(newKhachHang);
    }
    @Override
    public Page<KhachHang> getAllKhachHangByTrangThai(int trangThai, int page, int size) {
        Pageable pageable = PageRequest.of(page, size);

        return khachHangRepository.findByTrangThai(trangThai, pageable);

    }



    @Override
    public KhachHang updateKhachHang(KhachHang khachHang) {
        khachHang.setNgaySua(LocalDate.now());
        return khachHangRepository.save(khachHang);
    }

    @Override
    public List<KhachHang> searchKhachHangByName(String ten) {
        return khachHangRepository.findByTenContainingIgnoreCase(ten);
    }

    @Override
    public KhachHang getKhachHangByEmail(String email) {
        return khachHangRepository.findKhachHangByEmail(email);
    }

    @Override
    public KhachHang deleteOtpKhachHang(String email) {
        khachHangRepository.findKhachHangByEmail(email).setOtpHash(null);
        khachHangRepository.findKhachHangByEmail(email).setTrangThaiOtp(null);
        return khachHangRepository.save(khachHangRepository.findKhachHangByEmail(email));
    }

    @Override
    public KhachHang updateOtpKhachHang(String email) {
        String otp = generateOTP();


        // Tạo email
        SimpleMailMessage message = new SimpleMailMessage();
        message.setTo(email);
        message.setSubject("Mã OTP của bạn");
        message.setText("Mã OTP của bạn là: " + otp);

        // Gửi email
        mailSender.send(message);

        khachHangRepository.findKhachHangByEmail(email).setOtpHash(hashOtpSHA256(otp));

        return khachHangRepository.save(khachHangRepository.findKhachHangByEmail(email));
    }

    @Override
    public KhachHang compareOtp(String email,String otp){

        if(khachHangRepository.findKhachHangByEmail(email).getOtpHash().equals(hashOtpSHA256(otp))){
            khachHangRepository.findKhachHangByEmail(email).setTrangThaiOtp(1);
        }else{
            khachHangRepository.findKhachHangByEmail(email).setTrangThaiOtp(0);
        }
        return khachHangRepository.save(khachHangRepository.findKhachHangByEmail(email));
    }



    // Tạo mã OTP 6 số
    public String generateOTP() {
        return String.valueOf(100000 + new Random().nextInt(900000));
    }

    public static String hashOtpSHA256(String otp) {
        try {
            MessageDigest digest = MessageDigest.getInstance("SHA-256");
            byte[] encodedHash = digest.digest(otp.getBytes(StandardCharsets.UTF_8));
            return Base64.getEncoder().encodeToString(encodedHash); // Chuyển sang dạng Base64
        } catch (NoSuchAlgorithmException e) {
            throw new RuntimeException("Lỗi khi băm OTP", e);
        }
    }


}

package com.example.dreambackend.services.chatlieu;

import com.example.dreambackend.entities.ChatLieu;
import com.example.dreambackend.entities.MauSac;
import com.example.dreambackend.repositories.ChatLieuRepository;
import com.example.dreambackend.requests.ChatLieuRequest;
import com.example.dreambackend.requests.MauSacRequest;
import com.example.dreambackend.responses.ChatLieuRespone;
import org.springframework.beans.BeanUtils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.util.List;
import java.util.Random;

@Service
public class ChatLieuService implements IChatLieuService {
    @Autowired
    ChatLieuRepository chatLieuRepository;

    @Override
    public List<ChatLieuRespone> getAllChatLieu() {
        return chatLieuRepository.getAllChatLieuRepone();
    }

    @Override
    public ChatLieu addChatLieu(ChatLieuRequest chatLieuRequest) {
        ChatLieu chatLieu = new ChatLieu();
        BeanUtils.copyProperties(chatLieuRequest, chatLieu);
        chatLieu.setMa(taoMaChatLieu());
        chatLieu.setNgayTao(LocalDate.now());
        chatLieu.setNgaySua(LocalDate.now());
        return chatLieuRepository.save(chatLieu);
    }

    public boolean existsChatLieu(String ten) {
        return chatLieuRepository.existsByTen(ten);
    }

    private String taoMaChatLieu() {
        Random random = new Random();
        String maChatLieu;
        do {
            int soNgauNhien = 1 + random.nextInt(9999); // Sinh số từ 1 đến 9999
            String maSo = String.format("%04d", soNgauNhien); // Định dạng thành 4 chữ số
            maChatLieu = "CL" + maSo;
        } while (chatLieuRepository.existsByMa(maChatLieu)); // Kiểm tra xem mã đã tồn tại chưa
        return maChatLieu;
    }

    @Override
    public ChatLieu getChatLieuById(Integer idChatLieu) {
        return chatLieuRepository.findById(idChatLieu).orElseThrow(()
                -> new RuntimeException("Không tim được id chất liệu"));
    }

    @Override
    public ChatLieu updateTrangThaiChatLieu(ChatLieuRequest request) {
        ChatLieu chatLieu = chatLieuRepository.findById(request.getId())
                .orElseThrow(() -> new RuntimeException("Không tìm thấy size với id: " + request.getId()));
        chatLieu.setTrangThai(request.getTrangThai());
        chatLieu.setNgaySua(LocalDate.now());
        return chatLieuRepository.save(chatLieu);
    }

}

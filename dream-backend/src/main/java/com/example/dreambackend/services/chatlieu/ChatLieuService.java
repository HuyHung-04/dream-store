package com.example.dreambackend.services.chatlieu;

import com.example.dreambackend.dtos.ChatLieuDto;
import com.example.dreambackend.entities.ChatLieu;
import com.example.dreambackend.repositories.ChatLieuRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.BeanUtils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
@Service
public class ChatLieuService implements IChatLieuService {
    @Autowired
    ChatLieuRepository chatLieuRepository;

    @Override
    public List<ChatLieu> getAllChatLieu() {
        return chatLieuRepository.findAll();
    }

    @Override
    public ChatLieu addChatLieu(ChatLieuDto chatLieuDto) {
        ChatLieu newChatLieu = ChatLieu.builder()
                .ma(chatLieuDto.getMa())
                .ten(chatLieuDto.getTen())
                .ngayTao(chatLieuDto.getNgayTao())
                .ngaySua(chatLieuDto.getNgaySua())
                .trangThai(chatLieuDto.getTrangThai())
                .build();
        return chatLieuRepository.save(newChatLieu);
    }

    @Override
    public ChatLieu updateChatLieu(Integer idChatLieu, ChatLieuDto chatLieuDto) {
        ChatLieu chatLieuUpdate = getChatLieuById(idChatLieu);
        chatLieuUpdate.setTen(chatLieuDto.getTen());
        chatLieuRepository.save(chatLieuUpdate);
        return chatLieuUpdate;
    }

    @Override
    public ChatLieu getChatLieuById(Integer idChatLieu) {
        return chatLieuRepository.findById(idChatLieu).orElseThrow(()
                -> new RuntimeException("Không tim được id chat liệu"));
    }

}

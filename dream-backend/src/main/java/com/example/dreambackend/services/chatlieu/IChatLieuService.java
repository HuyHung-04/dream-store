package com.example.dreambackend.services.chatlieu;

import com.example.dreambackend.dtos.ChatLieuDto;
import com.example.dreambackend.entities.ChatLieu;

import java.util.List;

public interface IChatLieuService {
    // danh sách
    List<ChatLieu> getAllChatLieu();
    // thêm
    ChatLieu addChatLieu(ChatLieuDto chatLieuDto);
    // sửa
    ChatLieu updateChatLieu(Integer idChatLieu, ChatLieuDto chatLieuDto);
    // lấy ra id
    ChatLieu getChatLieuById(Integer idChatLieu);
}

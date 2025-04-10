package com.example.dreambackend.services.chatlieu;

import com.example.dreambackend.entities.ChatLieu;
import com.example.dreambackend.requests.ChatLieuRequest;
import com.example.dreambackend.responses.ChatLieuRespone;

import java.util.List;

public interface IChatLieuService {
    List<ChatLieuRespone> getAllChatLieu();

    ChatLieu addChatLieu(ChatLieuRequest chatLieuRequest);

    ChatLieu getChatLieuById(Integer id);

    ChatLieu updateTrangThaiChatLieu(ChatLieuRequest request);
}

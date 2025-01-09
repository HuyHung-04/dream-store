package com.example.dreambackend.controllers;

import com.example.dreambackend.dtos.ChatLieuDto;
import com.example.dreambackend.entities.ChatLieu;
import com.example.dreambackend.services.chatlieu.ChatLieuService;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/chat-lieu")
// cho phép các request Angular truy cập vào các API
@CrossOrigin(origins = "http://localhost:4200")
public class ChatLieuController {
    @Autowired
    ChatLieuService chatLieuService;

    @GetMapping("/hien-thi")
    public ResponseEntity<List<ChatLieu>> hienThi(){
        List<ChatLieu> listChatLieu = chatLieuService.getAllChatLieu();
        return ResponseEntity.ok(listChatLieu);
    }

    @PostMapping("/add")
    public ResponseEntity<?> add(@RequestBody ChatLieuDto chatLieuDto){
        chatLieuService.addChatLieu(chatLieuDto);
        return ResponseEntity.ok("Thêm thành công");
    }
}

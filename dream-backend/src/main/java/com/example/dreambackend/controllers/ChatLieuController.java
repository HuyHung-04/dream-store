package com.example.dreambackend.controllers;

import com.example.dreambackend.requests.ChatLieuRequest;
import com.example.dreambackend.responses.ChatLieuRespone;
import com.example.dreambackend.services.chatlieu.ChatLieuService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.BindingResult;
import org.springframework.validation.FieldError;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/chat-lieu")
// cho phép các request Angular truy cập vào các API
@CrossOrigin(origins = {"http://localhost:4200", "http://localhost:4201"})
public class ChatLieuController {
    @Autowired
    ChatLieuService chatLieuService;

    @GetMapping("/hien-thi")
    public ResponseEntity<List<ChatLieuRespone>> hienThi(){
        List<ChatLieuRespone> chatLieuRespones = chatLieuService.getAllChatLieu();
        return ResponseEntity.ok(chatLieuRespones);
    }

    @PostMapping("/add")
    public ResponseEntity<?> add(@Valid @RequestBody ChatLieuRequest chatLieuRequest, BindingResult result){
        if (result.hasErrors()) {
            Map<String, String> errors = new HashMap<>();
            for (FieldError error : result.getFieldErrors()) {
                errors.put(error.getField(), error.getDefaultMessage());
            }
            return ResponseEntity.badRequest().body(errors);
        }
        chatLieuService.addChatLieu(chatLieuRequest);
        Map<String, String> response = new HashMap<>();
        response.put("message", "Thêm thành công");
        return ResponseEntity.ok(response);
    }

    @PutMapping("/update-trang-thai")
    public ResponseEntity<?> update(@RequestBody ChatLieuRequest chatLieuRequest){
        chatLieuService.updateTrangThaiChatLieu(chatLieuRequest);
        Map<String, String> response = new HashMap<>();
        response.put("message", "Cập nhật trạng thái thành công");
        return ResponseEntity.ok(response);

    }
}

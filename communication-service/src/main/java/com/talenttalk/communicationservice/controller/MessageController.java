package com.talenttalk.communicationservice.controller;

import com.talenttalk.communicationservice.dto.MessageRequest;
import com.talenttalk.communicationservice.entity.Message;
import com.talenttalk.communicationservice.service.MessageService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/message")
@RequiredArgsConstructor
public class MessageController {

    private final MessageService messageService;
    @PostMapping("/send")
    public ResponseEntity<Message> sendMessage(
            @Valid @RequestBody MessageRequest request) {
        return ResponseEntity.ok(messageService.sendMessage(request));
    }


    @GetMapping("/conversation/{userId1}/{userId2}")
    public ResponseEntity<List<Message>> getConversation(
            @PathVariable Long userId1,
            @PathVariable Long userId2) {
        return ResponseEntity.ok(messageService.getConversation(userId1, userId2));
    }
    @GetMapping("/unread/{receiverId}")
    public ResponseEntity<List<Message>> getUnreadMessages(
            @PathVariable Long receiverId) {
        return ResponseEntity.ok(messageService.getUnreadMessages(receiverId));
    }



    @PatchMapping("/{messageId}/read")
    public ResponseEntity<Message> markAsRead(
            @PathVariable Long messageId) {
        return ResponseEntity.ok(messageService.markAsRead(messageId));
    }
}

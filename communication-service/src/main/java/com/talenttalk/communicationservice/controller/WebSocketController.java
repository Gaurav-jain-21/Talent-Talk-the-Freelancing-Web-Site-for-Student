package com.talenttalk.communicationservice.controller;

import com.talenttalk.communicationservice.dto.ChatMessage;
import com.talenttalk.communicationservice.dto.MessageRequest;
import com.talenttalk.communicationservice.service.MessageService;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.Payload;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Controller;

import java.time.LocalDateTime;

@Controller
@RequiredArgsConstructor
public class WebSocketController {
    @Autowired
    private SimpMessagingTemplate messagingTemplate;

    @Autowired
    private MessageService messageService;

    @MessageMapping("/chat")
    public void sendMessage(@Payload ChatMessage chatMessage){
        MessageRequest request = new MessageRequest();
        request.setSenderId(chatMessage.getSenderId());
        request.setReceiverId(chatMessage.getReceiverId());
        request.setSenderName(chatMessage.getSenderName());
        request.setContent(chatMessage.getContent());
        messageService.sendMessage(request);
        chatMessage.setTimestamp(LocalDateTime.now().toString());

        messagingTemplate.convertAndSend(
                "/topic/messages/" + chatMessage.getReceiverId(),
                chatMessage
        );

    }
}

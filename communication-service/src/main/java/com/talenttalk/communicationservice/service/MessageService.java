package com.talenttalk.communicationservice.service;

import com.talenttalk.communicationservice.dto.MessageRequest;
import com.talenttalk.communicationservice.entity.Message;
import com.talenttalk.communicationservice.repository.MessageRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class MessageService {

    private final MessageRepository messageRepository;


    public Message sendMessage(MessageRequest request) {
        Message message = new Message();
        message.setSenderId(request.getSenderId());
        message.setReceiverId(request.getReceiverId());
        message.setSenderName(request.getSenderName());
        message.setContent(request.getContent());
        message.setIsRead(false); // always unread when first sent

        return messageRepository.save(message);
    }


    public List<Message> getConversation(Long userId1, Long userId2) {
        return messageRepository.findConversation(userId1, userId2);
    }


    public List<Message> getUnreadMessages(Long receiverId) {
        return messageRepository.findByReceiverIdAndIsReadFalse(receiverId);
    }

    public Message markAsRead(Long messageId) {
        Message message = messageRepository.findById(messageId)
                .orElseThrow(() -> new RuntimeException("Message not found"));
        message.setIsRead(true);
        return messageRepository.save(message);
    }
}

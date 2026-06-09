package com.autoskola.trainingservice.dto;

import java.time.LocalDateTime;

public class NotificationMessage {
    private String type;
    private String title;
    private String body;
    private Object data;
    private LocalDateTime timestamp;

    public NotificationMessage(String type, String title, String body, Object data) {
        this.type = type;
        this.title = title;
        this.body = body;
        this.data = data;
        this.timestamp = LocalDateTime.now();
    }

    public String getType() { return type; }
    public String getTitle() { return title; }
    public String getBody() { return body; }
    public Object getData() { return data; }
    public LocalDateTime getTimestamp() { return timestamp; }
}

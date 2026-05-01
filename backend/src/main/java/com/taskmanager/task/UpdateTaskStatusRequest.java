package com.taskmanager.task;

import lombok.Data;

@Data
public class UpdateTaskStatusRequest {
    private TaskStatus status;
}

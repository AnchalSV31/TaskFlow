package com.taskmanager.task;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Data;

import java.time.LocalDate;

@Data
public class CreateTaskRequest {
    @NotBlank(message = "Task title is required")
    @Size(max = 255, message = "Title too long")
    private String title;

    private String description;

    private TaskPriority priority = TaskPriority.MEDIUM;

    private LocalDate dueDate;

    private Long assigneeId;
}

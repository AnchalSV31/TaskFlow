package com.taskmanager.project;

import lombok.Data;

@Data
public class UpdateProjectRequest {
    private String name;
    private String description;
    private String status; // ACTIVE or ARCHIVED
}

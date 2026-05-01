package com.taskmanager.project;

import com.taskmanager.user.UserDTO;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ProjectDTO {
    private Long id;
    private String name;
    private String description;
    private String status;
    private UserDTO owner;
    private List<UserDTO> members;
    private long taskCount;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    public static ProjectDTO from(Project project) {
        return ProjectDTO.builder()
                .id(project.getId())
                .name(project.getName())
                .description(project.getDescription())
                .status(project.getStatus().name())
                .owner(UserDTO.from(project.getOwner()))
                .members(project.getMembers().stream()
                        .map(UserDTO::from)
                        .collect(Collectors.toList()))
                .createdAt(project.getCreatedAt())
                .updatedAt(project.getUpdatedAt())
                .build();
    }
}

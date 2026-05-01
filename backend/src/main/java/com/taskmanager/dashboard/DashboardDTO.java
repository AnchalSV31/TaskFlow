package com.taskmanager.dashboard;

import com.fasterxml.jackson.annotation.JsonProperty;
import com.taskmanager.task.TaskDTO;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;
import java.util.Map;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class DashboardDTO {
    // Personal stats (all roles)
    private long totalMyTasks;
    private long overdueTasks;
    private Map<String, Long> tasksByStatus;
    private List<TaskDTO> recentTasks;
    private long myProjects;

    // Admin-only team overview
    @JsonProperty("isAdmin")
    private boolean isAdmin;
    private long allTasksCount;
    private long allProjectsCount;
    private Map<String, Long> teamTasksByStatus;
    private List<TaskDTO> recentAllTasks;
}

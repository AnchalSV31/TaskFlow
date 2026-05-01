package com.taskmanager.dashboard;

import com.taskmanager.project.ProjectRepository;
import com.taskmanager.task.TaskDTO;
import com.taskmanager.task.TaskRepository;
import com.taskmanager.task.TaskStatus;
import com.taskmanager.user.User;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class DashboardService {

    private final TaskRepository taskRepository;
    private final ProjectRepository projectRepository;

    public DashboardDTO getDashboard(User currentUser) {
        Long userId = currentUser.getId();
        LocalDate today = LocalDate.now();
        boolean adminRole = currentUser.getRole().name().equals("ADMIN");

        // ── Personal stats (all roles) ──────────────────────────────────
        long todoCount   = taskRepository.countByAssigneeIdAndStatus(userId, TaskStatus.TODO);
        long inProgCount = taskRepository.countByAssigneeIdAndStatus(userId, TaskStatus.IN_PROGRESS);
        long doneCount   = taskRepository.countByAssigneeIdAndStatus(userId, TaskStatus.DONE);
        long totalMyTasks = todoCount + inProgCount + doneCount;

        long overdueTasks = taskRepository.countOverdueByUser(userId, today);

        Map<String, Long> tasksByStatus = new HashMap<>();
        tasksByStatus.put("TODO", todoCount);
        tasksByStatus.put("IN_PROGRESS", inProgCount);
        tasksByStatus.put("DONE", doneCount);

        List<TaskDTO> recentTasks = taskRepository
                .findRecentByUser(userId, PageRequest.of(0, 5))
                .stream()
                .map(TaskDTO::from)
                .collect(Collectors.toList());

        long myProjects = projectRepository.findAllByMemberOrOwner(userId).size();

        DashboardDTO dto = DashboardDTO.builder()
                .totalMyTasks(totalMyTasks)
                .overdueTasks(overdueTasks)
                .tasksByStatus(tasksByStatus)
                .recentTasks(recentTasks)
                .myProjects(myProjects)
                .isAdmin(adminRole)
                .build();

        // ── Admin-only team overview ─────────────────────────────────────
        if (adminRole) {
            long allTasksCount    = taskRepository.count();
            long allProjectsCount = projectRepository.count();

            Map<String, Long> teamTasksByStatus = new HashMap<>();
            teamTasksByStatus.put("TODO",        taskRepository.countByStatus(TaskStatus.TODO));
            teamTasksByStatus.put("IN_PROGRESS", taskRepository.countByStatus(TaskStatus.IN_PROGRESS));
            teamTasksByStatus.put("DONE",        taskRepository.countByStatus(TaskStatus.DONE));

            List<TaskDTO> recentAllTasks = taskRepository
                    .findRecentAllTasks(PageRequest.of(0, 8))
                    .stream()
                    .map(TaskDTO::from)
                    .collect(Collectors.toList());

            dto.setAllTasksCount(allTasksCount);
            dto.setAllProjectsCount(allProjectsCount);
            dto.setTeamTasksByStatus(teamTasksByStatus);
            dto.setRecentAllTasks(recentAllTasks);
        }

        log.debug("Dashboard built for user: {} (admin={})", currentUser.getEmail(), adminRole);
        return dto;
    }
}

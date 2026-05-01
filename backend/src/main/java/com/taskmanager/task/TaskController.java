package com.taskmanager.task;

import com.taskmanager.common.ApiResponse;
import com.taskmanager.user.User;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

@RestController
@RequiredArgsConstructor
public class TaskController {

    private final TaskService taskService;

    @GetMapping("/api/projects/{projectId}/tasks")
    public ResponseEntity<ApiResponse<Page<TaskDTO>>> getProjectTasks(
            @PathVariable Long projectId,
            @AuthenticationPrincipal User currentUser,
            @RequestParam(required = false) TaskStatus status,
            @RequestParam(required = false) Long assigneeId,
            @RequestParam(required = false) TaskPriority priority,
            @PageableDefault(size = 20) Pageable pageable) {
        return ResponseEntity.ok(ApiResponse.success(
                taskService.getProjectTasks(projectId, currentUser, status, assigneeId, priority, pageable)));
    }

    @PostMapping("/api/projects/{projectId}/tasks")
    public ResponseEntity<ApiResponse<TaskDTO>> createTask(
            @PathVariable Long projectId,
            @AuthenticationPrincipal User currentUser,
            @Valid @RequestBody CreateTaskRequest request) {
        TaskDTO task = taskService.createTask(projectId, currentUser, request);
        return ResponseEntity.status(HttpStatus.CREATED).body(ApiResponse.success(task, "Task created"));
    }

    @GetMapping("/api/tasks/{id}")
    public ResponseEntity<ApiResponse<TaskDTO>> getTask(
            @PathVariable Long id,
            @AuthenticationPrincipal User currentUser) {
        return ResponseEntity.ok(ApiResponse.success(taskService.getTaskById(id, currentUser)));
    }

    @PutMapping("/api/tasks/{id}")
    public ResponseEntity<ApiResponse<TaskDTO>> updateTask(
            @PathVariable Long id,
            @AuthenticationPrincipal User currentUser,
            @RequestBody UpdateTaskRequest request) {
        return ResponseEntity.ok(ApiResponse.success(taskService.updateTask(id, currentUser, request)));
    }

    @PatchMapping("/api/tasks/{id}/status")
    public ResponseEntity<ApiResponse<TaskDTO>> updateTaskStatus(
            @PathVariable Long id,
            @AuthenticationPrincipal User currentUser,
            @RequestBody UpdateTaskStatusRequest request) {
        return ResponseEntity.ok(ApiResponse.success(
                taskService.updateTaskStatus(id, currentUser, request.getStatus())));
    }

    @DeleteMapping("/api/tasks/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<Void>> deleteTask(@PathVariable Long id) {
        taskService.deleteTask(id);
        return ResponseEntity.ok(ApiResponse.success(null, "Task deleted"));
    }
}

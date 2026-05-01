package com.taskmanager.task;

// import com.taskmanager.exception.BadRequestException;
import com.taskmanager.exception.ResourceNotFoundException;
import com.taskmanager.project.Project;
import com.taskmanager.project.ProjectService;
import com.taskmanager.user.User;
import com.taskmanager.user.UserService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Slf4j
@Service
@RequiredArgsConstructor
public class TaskService {

    private final TaskRepository taskRepository;
    private final ProjectService projectService;
    private final UserService userService;

    @Transactional(readOnly = true)
    public Page<TaskDTO> getProjectTasks(Long projectId, User currentUser,
            TaskStatus status, Long assigneeId,
            TaskPriority priority, Pageable pageable) {
        projectService.findProjectAndCheckAccess(projectId, currentUser);
        return taskRepository.findByProjectIdWithFilters(projectId, status, assigneeId, priority, pageable)
                .map(TaskDTO::from);
    }

    @Transactional
    public TaskDTO createTask(Long projectId, User currentUser, CreateTaskRequest request) {
        Project project = projectService.findProjectAndCheckAccess(projectId, currentUser);

        User assignee = null;
        if (request.getAssigneeId() != null) {
            assignee = userService.getUserById(request.getAssigneeId());
        }

        Task task = Task.builder()
                .title(request.getTitle())
                .description(request.getDescription())
                .priority(request.getPriority() != null ? request.getPriority() : TaskPriority.MEDIUM)
                .status(TaskStatus.TODO)
                .dueDate(request.getDueDate())
                .project(project)
                .assignee(assignee)
                .createdBy(currentUser)
                .build();

        task = taskRepository.save(task);
        log.info("Task created: {} in project {}", task.getTitle(), projectId);
        return TaskDTO.from(task);
    }

    @Transactional(readOnly = true)
    public TaskDTO getTaskById(Long id, User currentUser) {
        Task task = taskRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Task", id));
        projectService.findProjectAndCheckAccess(task.getProject().getId(), currentUser);
        return TaskDTO.from(task);
    }

    @Transactional
    public TaskDTO updateTask(Long id, User currentUser, UpdateTaskRequest request) {
        Task task = taskRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Task", id));
        projectService.findProjectAndCheckAccess(task.getProject().getId(), currentUser);

        if (request.getTitle() != null && !request.getTitle().isBlank()) {
            task.setTitle(request.getTitle());
        }
        if (request.getDescription() != null) {
            task.setDescription(request.getDescription());
        }
        if (request.getPriority() != null) {
            task.setPriority(request.getPriority());
        }
        if (request.getStatus() != null) {
            task.setStatus(request.getStatus());
        }
        if (request.getDueDate() != null) {
            task.setDueDate(request.getDueDate());
        }
        if (request.getAssigneeId() != null) {
            User assignee = userService.getUserById(request.getAssigneeId());
            task.setAssignee(assignee);
        }

        return TaskDTO.from(taskRepository.save(task));
    }

    @Transactional
    public TaskDTO updateTaskStatus(Long id, User currentUser, TaskStatus newStatus) {
        Task task = taskRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Task", id));

        boolean isAdmin = currentUser.getRole().name().equals("ADMIN");
        boolean isAssignee = task.getAssignee() != null
                && task.getAssignee().getId().equals(currentUser.getId());

        if (!isAdmin && !isAssignee) {
            throw new AccessDeniedException("Only the assignee or admin can update task status");
        }

        task.setStatus(newStatus);
        return TaskDTO.from(taskRepository.save(task));
    }

    @Transactional
    public void deleteTask(Long id) {
        if (!taskRepository.existsById(id)) {
            throw new ResourceNotFoundException("Task", id);
        }
        taskRepository.deleteById(id);
        log.info("Task deleted: {}", id);
    }
}

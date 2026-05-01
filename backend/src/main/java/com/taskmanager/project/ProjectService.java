package com.taskmanager.project;

import com.taskmanager.exception.BadRequestException;
import com.taskmanager.exception.ResourceNotFoundException;
import com.taskmanager.task.TaskRepository;
import com.taskmanager.user.User;
import com.taskmanager.user.UserService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class ProjectService {

    private final ProjectRepository projectRepository;
    private final UserService userService;
    private final TaskRepository taskRepository;

    @Transactional(readOnly = true)
    public Page<ProjectDTO> getUserProjects(User currentUser, Pageable pageable) {
        List<Project> projects = projectRepository.findAllByMemberOrOwner(currentUser.getId());
        List<ProjectDTO> dtos = projects.stream()
                .map(p -> {
                    ProjectDTO dto = ProjectDTO.from(p);
                    dto.setTaskCount(taskRepository.countByProjectId(p.getId()));
                    return dto;
                })
                .collect(Collectors.toList());
        int start = (int) pageable.getOffset();
        int end = Math.min(start + pageable.getPageSize(), dtos.size());
        return new PageImpl<>(dtos.subList(start, end), pageable, dtos.size());
    }

    @Transactional
    public ProjectDTO createProject(User owner, CreateProjectRequest request) {
        Project project = Project.builder()
                .name(request.getName())
                .description(request.getDescription())
                .owner(owner)
                .status(ProjectStatus.ACTIVE)
                .build();
        project.getMembers().add(owner); // owner is always a member
        project = projectRepository.save(project);
        log.info("Project created: {} by {}", project.getName(), owner.getEmail());
        return ProjectDTO.from(project);
    }

    @Transactional(readOnly = true)
    public ProjectDTO getProjectById(Long id, User currentUser) {
        Project project = findProjectAndCheckAccess(id, currentUser);
        return ProjectDTO.from(project);
    }

    @Transactional
    public ProjectDTO updateProject(Long id, UpdateProjectRequest request) {
        Project project = projectRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Project", id));

        if (request.getName() != null && !request.getName().isBlank()) {
            project.setName(request.getName());
        }
        if (request.getDescription() != null) {
            project.setDescription(request.getDescription());
        }
        if (request.getStatus() != null) {
            project.setStatus(ProjectStatus.valueOf(request.getStatus()));
        }

        return ProjectDTO.from(projectRepository.save(project));
    }

    @Transactional
    public void archiveProject(Long id) {
        Project project = projectRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Project", id));
        project.setStatus(ProjectStatus.ARCHIVED);
        projectRepository.save(project);
        log.info("Project archived: {}", id);
    }

    @Transactional
    public ProjectDTO addMember(Long projectId, Long userId) {
        Project project = projectRepository.findById(projectId)
                .orElseThrow(() -> new ResourceNotFoundException("Project", projectId));
        User user = userService.getUserById(userId);

        if (project.getMembers().contains(user)) {
            throw new BadRequestException("User is already a member of this project");
        }
        project.getMembers().add(user);
        return ProjectDTO.from(projectRepository.save(project));
    }

    @Transactional
    public ProjectDTO removeMember(Long projectId, Long userId) {
        Project project = projectRepository.findById(projectId)
                .orElseThrow(() -> new ResourceNotFoundException("Project", projectId));
        User user = userService.getUserById(userId);

        if (project.getOwner().getId().equals(userId)) {
            throw new BadRequestException("Cannot remove the project owner");
        }
        project.getMembers().remove(user);
        return ProjectDTO.from(projectRepository.save(project));
    }

    public Project findProjectAndCheckAccess(Long id, User currentUser) {
        Project project = projectRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Project", id));

        boolean isAdmin = currentUser.getRole().name().equals("ADMIN");
        boolean isMember = project.getMembers().stream()
                .anyMatch(m -> m.getId().equals(currentUser.getId()));
        boolean isOwner = project.getOwner().getId().equals(currentUser.getId());

        if (!isAdmin && !isMember && !isOwner) {
            throw new org.springframework.security.access.AccessDeniedException(
                    "You don't have access to this project");
        }
        return project;
    }
}

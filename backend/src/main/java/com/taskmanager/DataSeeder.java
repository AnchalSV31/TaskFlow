package com.taskmanager;

import com.taskmanager.project.Project;
import com.taskmanager.project.ProjectRepository;
import com.taskmanager.project.ProjectStatus;
import com.taskmanager.task.Task;
import com.taskmanager.task.TaskPriority;
import com.taskmanager.task.TaskRepository;
import com.taskmanager.task.TaskStatus;
import com.taskmanager.user.Role;
import com.taskmanager.user.User;
import com.taskmanager.user.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import java.time.LocalDate;

@Slf4j
@Component
@RequiredArgsConstructor
public class DataSeeder implements CommandLineRunner {

    private final UserRepository userRepository;
    private final ProjectRepository projectRepository;
    private final TaskRepository taskRepository;
    private final PasswordEncoder passwordEncoder;

    @Override
    public void run(String... args) {
        if (userRepository.count() > 0) {
            log.info("Database already seeded, skipping.");
            return;
        }

        log.info("Seeding database...");

        // Create admin
        User admin = userRepository.save(User.builder()
                .name("Admin User")
                .email("admin@test.com")
                .password(passwordEncoder.encode("Admin@123"))
                .role(Role.ADMIN)
                .build());

        // Create members
        User member1 = userRepository.save(User.builder()
                .name("Alice Johnson")
                .email("alice@test.com")
                .password(passwordEncoder.encode("Member@123"))
                .role(Role.MEMBER)
                .build());

        User member2 = userRepository.save(User.builder()
                .name("Bob Smith")
                .email("bob@test.com")
                .password(passwordEncoder.encode("Member@123"))
                .role(Role.MEMBER)
                .build());

        // Create projects
        Project project1 = new Project();
        project1.setName("Website Redesign");
        project1.setDescription("Redesign the company website with modern UI/UX");
        project1.setStatus(ProjectStatus.ACTIVE);
        project1.setOwner(admin);
        project1.getMembers().add(admin);
        project1.getMembers().add(member1);
        project1.getMembers().add(member2);
        project1 = projectRepository.save(project1);

        Project project2 = new Project();
        project2.setName("Mobile App MVP");
        project2.setDescription("Build the minimum viable product for the mobile app");
        project2.setStatus(ProjectStatus.ACTIVE);
        project2.setOwner(admin);
        project2.getMembers().add(admin);
        project2.getMembers().add(member2);
        project2 = projectRepository.save(project2);

        // Create tasks
        taskRepository.save(Task.builder()
                .title("Design homepage mockup")
                .description("Create wireframes and high-fidelity mockups for the homepage")
                .status(TaskStatus.DONE)
                .priority(TaskPriority.HIGH)
                .dueDate(LocalDate.now().minusDays(5))
                .project(project1)
                .assignee(member1)
                .createdBy(admin)
                .build());

        taskRepository.save(Task.builder()
                .title("Implement responsive navigation")
                .description("Build mobile-first responsive navigation component")
                .status(TaskStatus.IN_PROGRESS)
                .priority(TaskPriority.HIGH)
                .dueDate(LocalDate.now().plusDays(3))
                .project(project1)
                .assignee(member1)
                .createdBy(admin)
                .build());

        taskRepository.save(Task.builder()
                .title("Write unit tests for auth module")
                .description("Achieve 80% test coverage on authentication flows")
                .status(TaskStatus.TODO)
                .priority(TaskPriority.MEDIUM)
                .dueDate(LocalDate.now().plusDays(7))
                .project(project1)
                .assignee(member2)
                .createdBy(admin)
                .build());

        taskRepository.save(Task.builder()
                .title("Set up CI/CD pipeline")
                .description("Configure GitHub Actions for automated testing and deployment")
                .status(TaskStatus.IN_PROGRESS)
                .priority(TaskPriority.MEDIUM)
                .dueDate(LocalDate.now().plusDays(10))
                .project(project2)
                .assignee(member2)
                .createdBy(admin)
                .build());

        taskRepository.save(Task.builder()
                .title("User authentication flow")
                .description("Implement login, signup, and password reset for mobile app")
                .status(TaskStatus.TODO)
                .priority(TaskPriority.HIGH)
                .dueDate(LocalDate.now().plusDays(14))
                .project(project2)
                .assignee(member2)
                .createdBy(admin)
                .build());

        log.info("Database seeded successfully! Admin: admin@test.com / Admin@123");
    }
}

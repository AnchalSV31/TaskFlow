package com.taskmanager;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.taskmanager.auth.LoginRequest;
import com.taskmanager.auth.SignupRequest;
import com.taskmanager.project.CreateProjectRequest;
import com.taskmanager.task.CreateTaskRequest;
import com.taskmanager.task.TaskPriority;
import com.taskmanager.user.Role;
import com.taskmanager.user.User;
import com.taskmanager.user.UserRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.MvcResult;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
class TaskIntegrationTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    private String adminToken;
    private Long projectId;

    @BeforeEach
    void setup() throws Exception {
        // Create admin if not exists
        if (!userRepository.existsByEmail("admin_task_test@test.com")) {
            userRepository.save(User.builder()
                    .name("Admin")
                    .email("admin_task_test@test.com")
                    .password(passwordEncoder.encode("Admin@123"))
                    .role(Role.ADMIN)
                    .build());
        }

        // Login as admin
        LoginRequest login = new LoginRequest();
        login.setEmail("admin_task_test@test.com");
        login.setPassword("Admin@123");

        MvcResult result = mockMvc.perform(post("/api/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(login)))
                .andExpect(status().isOk())
                .andReturn();

        String response = result.getResponse().getContentAsString();
        adminToken = objectMapper.readTree(response).path("data").path("accessToken").asText();

        // Create project
        CreateProjectRequest projectReq = new CreateProjectRequest();
        projectReq.setName("Test Project " + System.currentTimeMillis());
        projectReq.setDescription("Integration test project");

        MvcResult projResult = mockMvc.perform(post("/api/projects")
                        .header("Authorization", "Bearer " + adminToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(projectReq)))
                .andExpect(status().isCreated())
                .andReturn();

        String projResponse = projResult.getResponse().getContentAsString();
        projectId = objectMapper.readTree(projResponse).path("data").path("id").asLong();
    }

    @Test
    void createTask_ShouldReturn201_WhenValidRequest() throws Exception {
        CreateTaskRequest request = new CreateTaskRequest();
        request.setTitle("Test Task");
        request.setDescription("Test description");
        request.setPriority(TaskPriority.HIGH);

        mockMvc.perform(post("/api/projects/" + projectId + "/tasks")
                        .header("Authorization", "Bearer " + adminToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.title").value("Test Task"))
                .andExpect(jsonPath("$.data.status").value("TODO"));
    }

    @Test
    void getProjectTasks_ShouldReturn200() throws Exception {
        mockMvc.perform(get("/api/projects/" + projectId + "/tasks")
                        .header("Authorization", "Bearer " + adminToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true));
    }

    @Test
    void getDashboard_ShouldReturn200() throws Exception {
        mockMvc.perform(get("/api/dashboard")
                        .header("Authorization", "Bearer " + adminToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.tasksByStatus").exists());
    }
}

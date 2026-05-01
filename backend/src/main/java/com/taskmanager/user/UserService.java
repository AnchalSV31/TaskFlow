package com.taskmanager.user;

// import com.taskmanager.common.ApiResponse;
import com.taskmanager.exception.ResourceNotFoundException;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Slf4j
@Service
@RequiredArgsConstructor
public class UserService {

    private final UserRepository userRepository;

    public UserDTO getCurrentUserProfile(User currentUser) {
        return UserDTO.from(currentUser);
    }

    @Transactional
    public UserDTO updateProfile(User currentUser, UpdateProfileRequest request) {
        currentUser.setName(request.getName());
        User saved = userRepository.save(currentUser);
        log.info("Updated profile for user: {}", saved.getEmail());
        return UserDTO.from(saved);
    }

    public Page<UserDTO> getAllUsers(Pageable pageable) {
        return userRepository.findAll(pageable).map(UserDTO::from);
    }

    public User getUserById(Long id) {
        return userRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("User", id));
    }
}

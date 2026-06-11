package ee.opiteed.tlu_opiteed.service;

import ee.opiteed.tlu_opiteed.dto.UserDto;
import ee.opiteed.tlu_opiteed.entity.User;
import ee.opiteed.tlu_opiteed.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class UserService {

    private final UserRepository userRepository;

    public UserDto getUserByEmail(String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("Kasutajat ei leitud: " + email));
        return new UserDto(user.getId(), user.getEmail(), user.getName(),
                user.getRole().name(), user.getCreatedAt());
    }
}

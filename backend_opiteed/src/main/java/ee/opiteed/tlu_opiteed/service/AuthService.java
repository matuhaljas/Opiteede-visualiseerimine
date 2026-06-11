package ee.opiteed.tlu_opiteed.service;

import ee.opiteed.tlu_opiteed.dto.AuthRequest;
import ee.opiteed.tlu_opiteed.dto.AuthResponse;
import ee.opiteed.tlu_opiteed.entity.Role;
import ee.opiteed.tlu_opiteed.entity.User;
import ee.opiteed.tlu_opiteed.repository.UserRepository;
import ee.opiteed.tlu_opiteed.security.JwtUtil;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class AuthService {

    private final UserRepository userRepository;
    private final JwtUtil jwtUtil;

    public AuthResponse loginWithFirebase(AuthRequest request) {
        User user = userRepository.findByFirebaseUid(request.getFirebaseUid())
                .map(existing -> {
                    if (!existing.getName().equals(request.getName())) {
                        existing.setName(request.getName());
                        return userRepository.save(existing);
                    }
                    return existing;
                })
                .orElseGet(() -> userRepository.save(
                        User.builder()
                                .firebaseUid(request.getFirebaseUid())
                                .email(request.getEmail())
                                .name(request.getName())
                                .role(Role.USER)
                                .build()
                ));

        String token = jwtUtil.generateToken(user.getEmail(), user.getRole().name());
        return new AuthResponse(token, user.getEmail(), user.getName(), user.getRole().name());
    }
}

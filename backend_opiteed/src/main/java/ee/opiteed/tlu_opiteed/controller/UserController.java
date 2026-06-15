package ee.opiteed.tlu_opiteed.controller;

import ee.opiteed.tlu_opiteed.dto.UserDto;
import ee.opiteed.tlu_opiteed.service.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

@CrossOrigin(origins = "https://opiteede-visualiseerimine-uvhe.onrender.com/")
@RestController
@RequestMapping("/api/users")
@RequiredArgsConstructor
public class UserController {

    private final UserService userService;

    @GetMapping("/me")
    public ResponseEntity<UserDto> getCurrentUser(Authentication authentication) {
        UserDto user = userService.getUserByEmail(authentication.getName());
        return ResponseEntity.ok(user);
    }
}

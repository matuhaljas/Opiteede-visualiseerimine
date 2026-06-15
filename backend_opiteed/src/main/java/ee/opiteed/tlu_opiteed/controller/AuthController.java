package ee.opiteed.tlu_opiteed.controller;

import ee.opiteed.tlu_opiteed.dto.AuthRequest;
import ee.opiteed.tlu_opiteed.dto.AuthResponse;
import ee.opiteed.tlu_opiteed.service.AuthService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@CrossOrigin(origins = "https://opiteede-visualiseerimine-uvhe.onrender.com/")
@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {

    private final AuthService authService;

    @PostMapping("/firebase")
    public ResponseEntity<AuthResponse> loginWithFirebase(@RequestBody AuthRequest request) {
        AuthResponse response = authService.loginWithFirebase(request);
        return ResponseEntity.ok(response);
    }
}

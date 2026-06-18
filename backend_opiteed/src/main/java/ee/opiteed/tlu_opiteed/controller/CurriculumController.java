package ee.opiteed.tlu_opiteed.controller;

import ee.opiteed.tlu_opiteed.dto.CurriculumRequest;
import ee.opiteed.tlu_opiteed.dto.CurriculumResponse;
import ee.opiteed.tlu_opiteed.service.CurriculumService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/curricula")
@RequiredArgsConstructor
public class CurriculumController {

    private final CurriculumService curriculumService;

    @GetMapping
    public ResponseEntity<List<CurriculumResponse>> getByOwner(Authentication auth) {
        String ownerUid = (String) auth.getCredentials();
        return ResponseEntity.ok(curriculumService.getByOwner(ownerUid));
    }

    @GetMapping("/shared-with-me")
    public ResponseEntity<List<CurriculumResponse>> getSharedWithMe(@RequestParam String email) {
        return ResponseEntity.ok(curriculumService.getSharedWithMe(email));
    }

    @GetMapping("/{id}")
    public ResponseEntity<CurriculumResponse> getById(@PathVariable Long id) {
        return ResponseEntity.ok(curriculumService.getById(id));
    }

    @PostMapping
    public ResponseEntity<CurriculumResponse> create(@RequestBody CurriculumRequest req, Authentication auth) {
        String ownerUid = (String) auth.getCredentials();
        return ResponseEntity.status(HttpStatus.CREATED).body(curriculumService.create(req, ownerUid));
    }

    @PutMapping("/{id}")
    public ResponseEntity<CurriculumResponse> update(@PathVariable Long id, @RequestBody CurriculumRequest req) {
        return ResponseEntity.ok(curriculumService.update(id, req));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        curriculumService.delete(id);
        return ResponseEntity.noContent().build();
    }
}

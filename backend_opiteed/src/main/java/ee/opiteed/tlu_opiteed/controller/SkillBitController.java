package ee.opiteed.tlu_opiteed.controller;

import ee.opiteed.tlu_opiteed.dto.SkillBitRequest;
import ee.opiteed.tlu_opiteed.dto.SkillBitResponse;
import ee.opiteed.tlu_opiteed.service.SkillBitService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/skillbits")
@RequiredArgsConstructor
public class SkillBitController {

    private final SkillBitService skillBitService;

    @GetMapping
    public ResponseEntity<List<SkillBitResponse>> getByCurriculumId(@RequestParam Long curriculumId) {
        return ResponseEntity.ok(skillBitService.getByCurriculumId(curriculumId));
    }

    @PostMapping
    public ResponseEntity<SkillBitResponse> create(@RequestBody SkillBitRequest req, Authentication auth) {
        String createdBy = auth != null ? auth.getName() : null;
        return ResponseEntity.status(HttpStatus.CREATED).body(skillBitService.create(req, createdBy));
    }

    @PutMapping("/{id}")
    public ResponseEntity<SkillBitResponse> update(@PathVariable Long id, @RequestBody SkillBitRequest req) {
        return ResponseEntity.ok(skillBitService.update(id, req));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        skillBitService.delete(id);
        return ResponseEntity.noContent().build();
    }
}

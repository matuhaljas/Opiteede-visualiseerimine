package ee.opiteed.tlu_opiteed.controller;

import ee.opiteed.tlu_opiteed.dto.KnowBitRequest;
import ee.opiteed.tlu_opiteed.dto.KnowBitResponse;
import ee.opiteed.tlu_opiteed.service.KnowBitService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@CrossOrigin(origins = "https://opiteede-visualiseerimine-uvhe.onrender.com/")
@RestController
@RequestMapping("/api/knowbits")
@RequiredArgsConstructor
public class KnowBitController {

    private final KnowBitService knowBitService;

    @GetMapping
    public ResponseEntity<List<KnowBitResponse>> getByCurriculumId(@RequestParam Long curriculumId) {
        return ResponseEntity.ok(knowBitService.getByCurriculumId(curriculumId));
    }

    @PostMapping
    public ResponseEntity<KnowBitResponse> create(@RequestBody KnowBitRequest req, Authentication auth) {
        String createdBy = auth != null ? auth.getName() : null;
        return ResponseEntity.status(HttpStatus.CREATED).body(knowBitService.create(req, createdBy));
    }

    @PutMapping("/{id}")
    public ResponseEntity<KnowBitResponse> update(@PathVariable Long id, @RequestBody KnowBitRequest req) {
        return ResponseEntity.ok(knowBitService.update(id, req));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        knowBitService.delete(id);
        return ResponseEntity.noContent().build();
    }
}

package ee.opiteed.tlu_opiteed.controller;

import ee.opiteed.tlu_opiteed.dto.ShareInfoResponse;
import ee.opiteed.tlu_opiteed.dto.ShareInviteRequest;
import ee.opiteed.tlu_opiteed.dto.ShareInviteResponse;
import ee.opiteed.tlu_opiteed.dto.SharePublicRequest;
import ee.opiteed.tlu_opiteed.service.CurriculumShareService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@CrossOrigin(origins = "https://opiteede-visualiseerimine-uvhe.onrender.com/")
@RestController
@RequestMapping("/api/curricula/{curriculumId}/shares")
@RequiredArgsConstructor
public class CurriculumShareController {

    private final CurriculumShareService shareService;

    @GetMapping
    public ResponseEntity<ShareInfoResponse> getShareInfo(@PathVariable Long curriculumId) {
        return ResponseEntity.ok(shareService.getShareInfo(curriculumId));
    }

    @PostMapping("/invite")
    public ResponseEntity<ShareInviteResponse> invite(
            @PathVariable Long curriculumId,
            @RequestBody ShareInviteRequest req,
            Authentication auth) {
        String sharedBy = auth != null ? auth.getName() : null;
        return ResponseEntity.status(HttpStatus.CREATED).body(shareService.invite(curriculumId, req, sharedBy));
    }

    @DeleteMapping("/{shareId}")
    public ResponseEntity<Void> removeInvite(@PathVariable Long shareId) {
        shareService.removeInvite(shareId);
        return ResponseEntity.noContent().build();
    }

    @PatchMapping("/public")
    public ResponseEntity<Map<String, Boolean>> setPublicAccess(
            @PathVariable Long curriculumId,
            @RequestBody SharePublicRequest req) {
        boolean result = shareService.setPublicAccess(curriculumId, req.isPublic());
        return ResponseEntity.ok(Map.of("isPublic", result));
    }
}

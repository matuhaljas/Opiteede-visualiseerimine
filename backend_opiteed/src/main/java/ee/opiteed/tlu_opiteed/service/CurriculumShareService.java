package ee.opiteed.tlu_opiteed.service;

import ee.opiteed.tlu_opiteed.dto.ShareInfoResponse;
import ee.opiteed.tlu_opiteed.dto.ShareInviteRequest;
import ee.opiteed.tlu_opiteed.dto.ShareInviteResponse;
import ee.opiteed.tlu_opiteed.entity.CurriculumShare;
import ee.opiteed.tlu_opiteed.entity.CurriculumVisibility;
import ee.opiteed.tlu_opiteed.repository.CurriculumShareRepository;
import ee.opiteed.tlu_opiteed.repository.CurriculumVisibilityRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class CurriculumShareService {

    private final CurriculumShareRepository shareRepository;
    private final CurriculumVisibilityRepository visibilityRepository;
    private final EmailService emailService;

    public ShareInfoResponse getShareInfo(Long curriculumId) {
        boolean isPublic = visibilityRepository.findByCurriculumId(curriculumId)
                .map(CurriculumVisibility::isPublic)
                .orElse(false);
        List<ShareInviteResponse> invites = shareRepository.findByCurriculumId(curriculumId)
                .stream().map(this::toInviteResponse).collect(Collectors.toList());
        return new ShareInfoResponse(isPublic, invites);
    }

    public ShareInviteResponse invite(Long curriculumId, ShareInviteRequest req, String sharedBy) {
        if (shareRepository.findByCurriculumIdAndEmail(curriculumId, req.getEmail()).isPresent()) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "Kasutaja on juba lisatud");
        }
        CurriculumShare saved = shareRepository.save(CurriculumShare.builder()
                .curriculumId(curriculumId)
                .email(req.getEmail())
                .role(req.getRole())
                .sharedBy(sharedBy)
                .build());

        emailService.saadaJagamisEmail(
                req.getEmail(),
                sharedBy != null ? sharedBy : "Keegi",
                req.getCurriculumName() != null ? req.getCurriculumName() : "Õppekava",
                curriculumId,
                req.getRole() != null ? req.getRole().name() : ""
        );

        return toInviteResponse(saved);
    }

    public void removeInvite(Long shareId) {
        if (!shareRepository.existsById(shareId)) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND);
        }
        shareRepository.deleteById(shareId);
    }

    public boolean setPublicAccess(Long curriculumId, boolean isPublic) {
        CurriculumVisibility visibility = visibilityRepository.findByCurriculumId(curriculumId)
                .orElse(CurriculumVisibility.builder().curriculumId(curriculumId).build());
        visibility.setPublic(isPublic);
        visibilityRepository.save(visibility);
        return isPublic;
    }

    private ShareInviteResponse toInviteResponse(CurriculumShare share) {
        return new ShareInviteResponse(share.getId(), share.getCurriculumId(),
                share.getEmail(), share.getRole(), share.getSharedBy(), share.getSharedAt());
    }
}

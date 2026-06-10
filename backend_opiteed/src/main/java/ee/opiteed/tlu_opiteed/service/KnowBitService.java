package ee.opiteed.tlu_opiteed.service;

import ee.opiteed.tlu_opiteed.dto.KnowBitRequest;
import ee.opiteed.tlu_opiteed.dto.KnowBitResponse;
import ee.opiteed.tlu_opiteed.entity.KnowBit;
import ee.opiteed.tlu_opiteed.repository.KnowBitRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class KnowBitService {

    private final KnowBitRepository knowBitRepository;

    public List<KnowBitResponse> getByCurriculumId(Long curriculumId) {
        return knowBitRepository.findByCurriculumId(curriculumId)
                .stream().map(this::toResponse).collect(Collectors.toList());
    }

    public KnowBitResponse create(KnowBitRequest req, String createdBy) {
        KnowBit saved = knowBitRepository.save(KnowBit.builder()
                .title(req.getTitle())
                .description(req.getDescription())
                .subject(req.getSubject())
                .gradeLevel(req.getGradeLevel())
                .curriculumId(req.getCurriculumId())
                .createdBy(createdBy)
                .build());
        return toResponse(saved);
    }

    public KnowBitResponse update(Long id, KnowBitRequest req) {
        KnowBit kb = knowBitRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND));
        kb.setTitle(req.getTitle());
        kb.setDescription(req.getDescription());
        kb.setSubject(req.getSubject());
        kb.setGradeLevel(req.getGradeLevel());
        return toResponse(knowBitRepository.save(kb));
    }

    public void delete(Long id) {
        if (!knowBitRepository.existsById(id)) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND);
        }
        knowBitRepository.deleteById(id);
    }

    private KnowBitResponse toResponse(KnowBit kb) {
        return new KnowBitResponse(kb.getId(), kb.getTitle(), kb.getDescription(),
                kb.getSubject(), kb.getGradeLevel(), kb.getCurriculumId(),
                kb.getCreatedBy(), kb.getCreatedAt());
    }
}

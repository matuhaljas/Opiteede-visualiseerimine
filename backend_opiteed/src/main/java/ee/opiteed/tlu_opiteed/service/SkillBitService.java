package ee.opiteed.tlu_opiteed.service;

import ee.opiteed.tlu_opiteed.dto.SkillBitRequest;
import ee.opiteed.tlu_opiteed.dto.SkillBitResponse;
import ee.opiteed.tlu_opiteed.entity.SkillBit;
import ee.opiteed.tlu_opiteed.repository.SkillBitRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class SkillBitService {

    private final SkillBitRepository skillBitRepository;

    public List<SkillBitResponse> getByCurriculumId(Long curriculumId) {
        return skillBitRepository.findByCurriculumId(curriculumId)
                .stream().map(this::toResponse).collect(Collectors.toList());
    }

    public SkillBitResponse create(SkillBitRequest req, String createdBy) {
        SkillBit saved = skillBitRepository.save(SkillBit.builder()
                .title(req.getTitle())
                .description(req.getDescription())
                .subject(req.getSubject())
                .gradeLevel(req.getGradeLevel())
                .curriculumId(req.getCurriculumId())
                .createdBy(createdBy)
                .build());
        return toResponse(saved);
    }

    public SkillBitResponse update(Long id, SkillBitRequest req) {
        SkillBit sb = skillBitRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND));
        sb.setTitle(req.getTitle());
        sb.setDescription(req.getDescription());
        sb.setSubject(req.getSubject());
        sb.setGradeLevel(req.getGradeLevel());
        return toResponse(skillBitRepository.save(sb));
    }

    public void delete(Long id) {
        if (!skillBitRepository.existsById(id)) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND);
        }
        skillBitRepository.deleteById(id);
    }

    private SkillBitResponse toResponse(SkillBit sb) {
        return new SkillBitResponse(sb.getId(), sb.getTitle(), sb.getDescription(),
                sb.getSubject(), sb.getGradeLevel(), sb.getCurriculumId(),
                sb.getCreatedBy(), sb.getCreatedAt());
    }
}

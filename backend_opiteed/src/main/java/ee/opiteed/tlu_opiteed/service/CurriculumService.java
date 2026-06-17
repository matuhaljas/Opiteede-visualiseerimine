package ee.opiteed.tlu_opiteed.service;

import ee.opiteed.tlu_opiteed.dto.CurriculumRequest;
import ee.opiteed.tlu_opiteed.dto.CurriculumResponse;
import ee.opiteed.tlu_opiteed.entity.Curriculum;
import ee.opiteed.tlu_opiteed.repository.CurriculumRepository;
import ee.opiteed.tlu_opiteed.repository.KnowBitRepository;
import ee.opiteed.tlu_opiteed.repository.SkillBitRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class CurriculumService {

    private final CurriculumRepository curriculumRepository;
    private final KnowBitRepository knowBitRepository;
    private final SkillBitRepository skillBitRepository;

    public List<CurriculumResponse> getByOwner(String ownerUid) {
        return curriculumRepository.findByOwnerUidOrderByUpdatedAtDesc(ownerUid)
                .stream().map(this::toResponse).collect(Collectors.toList());
    }

    public CurriculumResponse getById(Long id) {
        return toResponse(findOrThrow(id));
    }

    public CurriculumResponse create(CurriculumRequest req, String ownerUid) {
        Curriculum saved = curriculumRepository.save(Curriculum.builder()
                .name(req.getName())
                .year(req.getYear())
                .ownerUid(ownerUid)
                .build());
        return toResponse(saved);
    }

    public CurriculumResponse update(Long id, CurriculumRequest req) {
        Curriculum c = findOrThrow(id);
        c.setName(req.getName());
        c.setYear(req.getYear());
        return toResponse(curriculumRepository.save(c));
    }

    @Transactional
    public void delete(Long id) {
        Curriculum c = findOrThrow(id);
        // Kustuta ka kõik kuuluvad ühikud, et andmebaasi ei jääks orvuks
        knowBitRepository.deleteByCurriculumId(c.getId());
        skillBitRepository.deleteByCurriculumId(c.getId());
        curriculumRepository.delete(c);
    }

    private Curriculum findOrThrow(Long id) {
        return curriculumRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Õppekava ei leitud"));
    }

    private CurriculumResponse toResponse(Curriculum c) {
        return new CurriculumResponse(
                c.getId(), c.getName(), c.getYear(), c.getOwnerUid(),
                knowBitRepository.countByCurriculumId(c.getId()),
                skillBitRepository.countByCurriculumId(c.getId()),
                c.getCreatedAt(), c.getUpdatedAt());
    }
}

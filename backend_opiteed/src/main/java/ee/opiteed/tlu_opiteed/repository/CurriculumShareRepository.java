package ee.opiteed.tlu_opiteed.repository;

import ee.opiteed.tlu_opiteed.entity.CurriculumShare;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface CurriculumShareRepository extends JpaRepository<CurriculumShare, Long> {
    List<CurriculumShare> findByCurriculumId(Long curriculumId);
    Optional<CurriculumShare> findByCurriculumIdAndEmail(Long curriculumId, String email);
    List<CurriculumShare> findByEmail(String email);
}

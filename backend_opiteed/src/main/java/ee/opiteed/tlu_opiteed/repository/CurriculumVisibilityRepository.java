package ee.opiteed.tlu_opiteed.repository;

import ee.opiteed.tlu_opiteed.entity.CurriculumVisibility;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface CurriculumVisibilityRepository extends JpaRepository<CurriculumVisibility, Long> {
    Optional<CurriculumVisibility> findByCurriculumId(Long curriculumId);
}

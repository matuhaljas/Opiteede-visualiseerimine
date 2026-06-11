package ee.opiteed.tlu_opiteed.repository;

import ee.opiteed.tlu_opiteed.entity.SkillBit;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface SkillBitRepository extends JpaRepository<SkillBit, Long> {
    List<SkillBit> findByCurriculumId(Long curriculumId);
}

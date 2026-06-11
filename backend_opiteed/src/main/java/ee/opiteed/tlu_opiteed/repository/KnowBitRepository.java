package ee.opiteed.tlu_opiteed.repository;

import ee.opiteed.tlu_opiteed.entity.KnowBit;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface KnowBitRepository extends JpaRepository<KnowBit, Long> {
    List<KnowBit> findByCurriculumId(Long curriculumId);
}

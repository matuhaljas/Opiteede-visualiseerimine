package ee.opiteed.tlu_opiteed.repository;

import ee.opiteed.tlu_opiteed.entity.Curriculum;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface CurriculumRepository extends JpaRepository<Curriculum, Long> {
    List<Curriculum> findByOwnerUidOrderByUpdatedAtDesc(String ownerUid);
}

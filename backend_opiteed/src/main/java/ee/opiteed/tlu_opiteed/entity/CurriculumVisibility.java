package ee.opiteed.tlu_opiteed.entity;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

@Entity
@Table(name = "curriculum_visibility")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CurriculumVisibility {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(unique = true, nullable = false)
    private Long curriculumId;

    @Column(nullable = false)
    private boolean isPublic;

    private LocalDateTime updatedAt;

    @PrePersist
    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }
}

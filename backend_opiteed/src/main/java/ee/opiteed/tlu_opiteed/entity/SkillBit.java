package ee.opiteed.tlu_opiteed.entity;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

@Entity
@Table(name = "skill_bits")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class SkillBit {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String title;

    @Column(columnDefinition = "TEXT")
    private String description;

    private String subject;

    private String gradeLevel;

    private String depthLevel;

    private String importance;

    @Column(columnDefinition = "TEXT")
    private String notes;

    @Column(nullable = false)
    private Long curriculumId;

    private Integer orderIndex;

    private String createdBy;

    private LocalDateTime createdAt;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
    }
}

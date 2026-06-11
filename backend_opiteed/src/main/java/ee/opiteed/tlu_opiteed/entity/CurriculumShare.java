package ee.opiteed.tlu_opiteed.entity;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

@Entity
@Table(name = "curriculum_shares",
        uniqueConstraints = @UniqueConstraint(columnNames = {"curriculum_id", "email"}))
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CurriculumShare {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "curriculum_id", nullable = false)
    private Long curriculumId;

    @Column(nullable = false)
    private String email;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private ShareRole role;

    private String sharedBy;

    private LocalDateTime sharedAt;

    @PrePersist
    protected void onCreate() {
        sharedAt = LocalDateTime.now();
    }
}

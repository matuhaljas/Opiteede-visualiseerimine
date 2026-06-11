package ee.opiteed.tlu_opiteed.dto;

import lombok.AllArgsConstructor;
import lombok.Data;

import java.time.LocalDateTime;

@Data
@AllArgsConstructor
public class SkillBitResponse {
    private Long id;
    private String title;
    private String description;
    private String subject;
    private String gradeLevel;
    private String depthLevel;
    private String importance;
    private String notes;
    private Long curriculumId;
    private String createdBy;
    private LocalDateTime createdAt;
}

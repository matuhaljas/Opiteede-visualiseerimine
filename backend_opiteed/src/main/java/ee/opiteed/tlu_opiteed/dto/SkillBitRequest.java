package ee.opiteed.tlu_opiteed.dto;

import lombok.Data;

@Data
public class SkillBitRequest {
    private String title;
    private String description;
    private String subject;
    private String gradeLevel;
    private Long curriculumId;
}

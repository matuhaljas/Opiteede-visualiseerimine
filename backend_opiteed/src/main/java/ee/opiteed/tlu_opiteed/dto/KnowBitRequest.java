package ee.opiteed.tlu_opiteed.dto;

import lombok.Data;

@Data
public class KnowBitRequest {
    private String title;
    private String description;
    private String subject;
    private String gradeLevel;
    private String depthLevel;
    private String importance;
    private String notes;
    private Integer orderIndex;
    private Long curriculumId;
}

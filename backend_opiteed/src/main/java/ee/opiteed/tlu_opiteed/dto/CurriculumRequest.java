package ee.opiteed.tlu_opiteed.dto;

import lombok.Data;

@Data
public class CurriculumRequest {
    private String name;
    private String year;
    private String ownerUid;
}

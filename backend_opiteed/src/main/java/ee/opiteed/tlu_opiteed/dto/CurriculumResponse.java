package ee.opiteed.tlu_opiteed.dto;

import lombok.AllArgsConstructor;
import lombok.Data;

import java.time.LocalDateTime;

@Data
@AllArgsConstructor
public class CurriculumResponse {
    private Long id;
    private String name;
    private String year;
    private String ownerUid;
    private long knowBitCount;
    private long skillBitCount;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}

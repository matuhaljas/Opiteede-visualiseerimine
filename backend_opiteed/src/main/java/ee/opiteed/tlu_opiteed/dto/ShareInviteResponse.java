package ee.opiteed.tlu_opiteed.dto;

import ee.opiteed.tlu_opiteed.entity.ShareRole;
import lombok.AllArgsConstructor;
import lombok.Data;

import java.time.LocalDateTime;

@Data
@AllArgsConstructor
public class ShareInviteResponse {
    private Long id;
    private Long curriculumId;
    private String email;
    private ShareRole role;
    private String sharedBy;
    private LocalDateTime sharedAt;
}

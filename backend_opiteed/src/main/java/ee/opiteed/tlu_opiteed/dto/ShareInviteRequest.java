package ee.opiteed.tlu_opiteed.dto;

import ee.opiteed.tlu_opiteed.entity.ShareRole;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class ShareInviteRequest {
    @Email
    @NotBlank
    private String email;
    private ShareRole role;
    private String curriculumName;
}

package ee.opiteed.tlu_opiteed.dto;

import ee.opiteed.tlu_opiteed.entity.ShareRole;
import lombok.Data;

@Data
public class ShareInviteRequest {
    private String email;
    private ShareRole role;
}

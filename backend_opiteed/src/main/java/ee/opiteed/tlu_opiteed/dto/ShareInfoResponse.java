package ee.opiteed.tlu_opiteed.dto;

import lombok.AllArgsConstructor;
import lombok.Data;

import java.util.List;

@Data
@AllArgsConstructor
public class ShareInfoResponse {
    private boolean isPublic;
    private List<ShareInviteResponse> invites;
}

package ee.opiteed.tlu_opiteed.dto;

import lombok.Data;

@Data
public class AuthRequest {
    private String firebaseUid;
    private String email;
    private String name;
}

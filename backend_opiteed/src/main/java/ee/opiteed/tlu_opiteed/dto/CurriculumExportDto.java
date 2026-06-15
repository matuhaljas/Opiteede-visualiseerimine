package ee.opiteed.tlu_opiteed.dto;

import lombok.AllArgsConstructor;
import lombok.Data;

import java.util.List;

@Data
@AllArgsConstructor
public class CurriculumExportDto {
    private String name;
    private String year;
    private List<KnowBitResponse> knowbits;
    private List<SkillBitResponse> skillbits;
}

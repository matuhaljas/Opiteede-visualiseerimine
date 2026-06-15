package ee.opiteed.tlu_opiteed.model;

import lombok.Data;

import java.util.List;

@Data
public class SpiralData {

    private List<SubjectMeta> subjects;
    private List<SpiralNode> nodes;
    private List<String[]> edges;
    private SubjectMeta selectedSubject;
    private List<String> schoolLevels;
    private Integer totalSkillBits;

    @Data
    public static class SubjectMeta {
        private String id;
        private String name;
        private int topicCount;
        private int subtopicCount;
        private int outcomeCount;
    }
}

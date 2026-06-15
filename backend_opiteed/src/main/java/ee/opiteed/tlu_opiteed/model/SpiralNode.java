package ee.opiteed.tlu_opiteed.model;

import lombok.Data;

import java.util.ArrayList;
import java.util.List;

@Data
public class SpiralNode {

    private String id;
    private String name;
    private String subjectId;
    private String subjectName;
    private String schoolLevel;
    private String nodeType;   // "topic" | "outcome"
    private String parentId;

    private List<String> expects = new ArrayList<>();
    private int orderIndex;
    private int outcomeCount;
    private List<SubtopicInfo> subtopics = new ArrayList<>();

    @Data
    public static class SubtopicInfo {
        private String name;
        private int orderIndex;
        private int outcomeCount;
    }
}

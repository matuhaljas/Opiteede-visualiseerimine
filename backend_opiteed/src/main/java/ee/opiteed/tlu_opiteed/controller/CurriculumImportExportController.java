package ee.opiteed.tlu_opiteed.controller;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import ee.opiteed.tlu_opiteed.dto.*;
import ee.opiteed.tlu_opiteed.service.CurriculumService;
import ee.opiteed.tlu_opiteed.service.KnowBitService;
import ee.opiteed.tlu_opiteed.service.SkillBitService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

@RestController
@RequestMapping("/api/curricula")
@RequiredArgsConstructor
public class CurriculumImportExportController {

    private final CurriculumService curriculumService;
    private final KnowBitService knowBitService;
    private final SkillBitService skillBitService;
    private final ObjectMapper objectMapper;

    @GetMapping("/{id}/export")
    public ResponseEntity<CurriculumExportDto> export(@PathVariable Long id) {
        CurriculumResponse curriculum = curriculumService.getById(id);
        List<KnowBitResponse> knowbits = knowBitService.getByCurriculumId(id);
        List<SkillBitResponse> skillbits = skillBitService.getByCurriculumId(id);
        return ResponseEntity.ok(new CurriculumExportDto(
                curriculum.getName(), curriculum.getYear(), knowbits, skillbits));
    }

    @PostMapping("/{id}/import")
    public ResponseEntity<Void> importCurriculum(
            @PathVariable Long id,
            @RequestParam("file") MultipartFile file) throws Exception {

        JsonNode root = objectMapper.readTree(file.getInputStream());

        if (root.has("@graph")) {
            importJsonLd(root, id);
        } else {
            importNative(root, id);
        }

        return ResponseEntity.ok().build();
    }

    // ── JSON-LD format (curriculum-export-*.jsonld) ────────────────────────
    // LearningOutcomes → KnowBits  (title=text, subject=subject name,
    //                                gradeLevel=schoolLevel, description=topic name)
    // SkillBits in the JSON-LD → SkillBits (title=name/text, same subject+gradeLevel)
    private void importJsonLd(JsonNode root, Long curriculumId) {
        JsonNode graph = root.get("@graph");
        if (graph == null || !graph.isArray()) return;

        for (JsonNode subject : graph) {
            String subjectName = text(subject, "name");
            JsonNode topics = subject.get("hasTopic");
            if (topics == null || !topics.isArray()) continue;

            for (JsonNode topic : topics) {
                String topicName = text(topic, "name");
                importOutcomesFromTopic(topic, subjectName, topicName, curriculumId);

                // recurse into subtopics
                JsonNode subtopics = topic.get("hasSubtopic");
                if (subtopics != null && subtopics.isArray()) {
                    for (JsonNode subtopic : subtopics) {
                        String subtopicName = text(subtopic, "name");
                        String label = topicName.isEmpty() ? subtopicName
                                : topicName + " › " + subtopicName;
                        importOutcomesFromTopic(subtopic, subjectName, label, curriculumId);
                    }
                }
            }
        }
    }

    private void importOutcomesFromTopic(JsonNode topic, String subjectName,
                                          String topicName, Long curriculumId) {
        JsonNode outcomes = topic.get("hasOutcome");
        if (outcomes != null && outcomes.isArray()) {
            for (JsonNode outcome : outcomes) {
                String title = text(outcome, "text_et");
                if (title.isEmpty()) title = text(outcome, "text");
                if (title.isEmpty()) continue;

                KnowBitRequest req = new KnowBitRequest();
                req.setTitle(title);
                req.setDescription(topicName);
                req.setSubject(subjectName);
                req.setGradeLevel(text(outcome, "schoolLevel"));
                req.setOrderIndex(intVal(outcome, "orderIndex"));
                req.setCurriculumId(curriculumId);
                knowBitService.create(req, null);
            }
        }

        JsonNode skillBits = topic.get("hasSkillBit");
        if (skillBits != null && skillBits.isArray()) {
            for (JsonNode sb : skillBits) {
                String title = text(sb, "name");
                if (title.isEmpty()) title = text(sb, "text");
                if (title.isEmpty()) continue;

                SkillBitRequest req = new SkillBitRequest();
                req.setTitle(title);
                req.setDescription(topicName);
                req.setSubject(subjectName);
                req.setGradeLevel(text(sb, "schoolLevel"));
                req.setOrderIndex(intVal(sb, "orderIndex"));
                req.setCurriculumId(curriculumId);
                skillBitService.create(req, null);
            }
        }
    }

    // ── Native export format ({ name, year, knowbits, skillbits }) ────────
    private void importNative(JsonNode root, Long curriculumId) throws Exception {
        CurriculumExportDto dto = objectMapper.treeToValue(root, CurriculumExportDto.class);

        if (dto.getKnowbits() != null) {
            for (KnowBitResponse kb : dto.getKnowbits()) {
                KnowBitRequest req = new KnowBitRequest();
                req.setTitle(kb.getTitle());
                req.setDescription(kb.getDescription());
                req.setSubject(kb.getSubject());
                req.setGradeLevel(kb.getGradeLevel());
                req.setDepthLevel(kb.getDepthLevel());
                req.setImportance(kb.getImportance());
                req.setNotes(kb.getNotes());
                req.setOrderIndex(kb.getOrderIndex());
                req.setCurriculumId(curriculumId);
                knowBitService.create(req, null);
            }
        }

        if (dto.getSkillbits() != null) {
            for (SkillBitResponse sb : dto.getSkillbits()) {
                SkillBitRequest req = new SkillBitRequest();
                req.setTitle(sb.getTitle());
                req.setDescription(sb.getDescription());
                req.setSubject(sb.getSubject());
                req.setGradeLevel(sb.getGradeLevel());
                req.setDepthLevel(sb.getDepthLevel());
                req.setImportance(sb.getImportance());
                req.setNotes(sb.getNotes());
                req.setOrderIndex(sb.getOrderIndex());
                req.setCurriculumId(curriculumId);
                skillBitService.create(req, null);
            }
        }
    }

    private String text(JsonNode node, String field) {
        JsonNode f = node.get(field);
        return (f != null && !f.isNull()) ? f.asText("") : "";
    }

    private Integer intVal(JsonNode node, String field) {
        JsonNode f = node.get(field);
        return (f != null && f.isNumber()) ? f.intValue() : null;
    }
}

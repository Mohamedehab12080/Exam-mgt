package com.iti.training.exam.core.mapper;

import com.iti.training.exam.model.dto.response.AttemptResponse;
import com.iti.training.exam.model.entities.Attempt;
import com.iti.training.exam.model.entities.Student;
import com.iti.training.exam.model.vto.AttemptView;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.Named;

import java.util.List;

@Mapper(componentModel = "spring", uses = {ExamMapper.class, AnswerMapper.class})
public abstract class AttemptMapper {

    @Mapping(source = "student.ssn", target = "studentSsn")
    @Mapping(expression = "java(mapStudentName(attempt.getStudent()))", target = "studentName")
    @Mapping(source = "exam.examId", target = "examId")
    @Mapping(source = "exam.title", target = "examTitle")
    public abstract AttemptResponse toResponse(Attempt attempt);

    @Named("mapStudentName")
    public String mapStudentName(Student student) {
        if (student == null) {
            return "Unknown Student";
        }
        return student.getFirstName() + " " + student.getLastName();
    }

    @Mapping(target = "answerCount", expression = "java(attempt.getAnswers() != null ? attempt.getAnswers().size() : 0)")
    public abstract AttemptView toAttemptView(Attempt attempt);

    public abstract List<AttemptView> toAttemptViews(List<Attempt> attempts);
}
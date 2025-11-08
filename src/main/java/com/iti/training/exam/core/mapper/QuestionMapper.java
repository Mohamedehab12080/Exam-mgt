package com.iti.training.exam.core.mapper;

import com.iti.training.exam.model.dto.QuestionDTO;
import com.iti.training.exam.model.dto.response.QuestionResponse;
import com.iti.training.exam.model.entities.Course;
import com.iti.training.exam.model.entities.ExamQuestion;
import com.iti.training.exam.model.entities.Question;
import com.iti.training.exam.model.vto.QuestionSummary;
import com.iti.training.exam.model.vto.QuestionView;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.Named;

import java.util.List;

@Mapper(componentModel = "spring",uses = {ChoiceMapper.class})
public abstract class QuestionMapper {

    @Mapping(source = "course.courseId", target = "courseId")
    @Mapping(source = "course.courseName", target = "courseName")
    public abstract QuestionResponse toResponse(Question question);

    @Mapping(source = "questionId", target = "questionId")
    @Mapping(source = "type", target = "type")
    @Mapping(source = "question", target = "questionText")
    @Mapping(source = "choices", target = "choices")
    public abstract QuestionView toQuestionView(Question question);
    public abstract List<QuestionView> toQuestionViews(List<Question> questions);

    @Mapping(source = "question.questionId", target = "questionId")
    @Mapping(source = "question.type", target = "type")
    @Mapping(source = "question.question", target = "questionText")
    @Mapping(source = "question.choices", target = "choices")
    public abstract List<QuestionView> toQuestionViewsFromExamQuestions(List<ExamQuestion> examQuestions);

    @Mapping(target = "questionText", source = "question")
    public abstract QuestionSummary toQuestionSummary(Question question);

    public abstract List<QuestionSummary> toQuestionSummaries(List<Question> questions);

    @Named("courseIdToCourse")
    public Course courseIdToCourse(Integer courseId) {
        if (courseId == null) return null;
        Course course = new Course();
        course.setCourseId(courseId);
        return course;
    }

    @Mapping(target = "course.courseId", source = "courseId")
    @Mapping(target = "question", source = "questionText")
    public abstract Question toQuestion(QuestionDTO questionDTO);

    @Mapping(target = "questionId", source = "question.questionId")
    @Mapping(target = "type", source = "question.type")
    @Mapping(target = "questionText", source = "question.question")
    @Mapping(target = "choices", source = "question.choices")
    public abstract QuestionView toQuestionView(ExamQuestion examQuestion);
}

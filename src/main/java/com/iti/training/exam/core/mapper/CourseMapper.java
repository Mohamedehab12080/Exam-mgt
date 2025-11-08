package com.iti.training.exam.core.mapper;

import com.iti.training.exam.model.dto.CourseDTO;
import com.iti.training.exam.model.dto.response.CourseResponse;
import com.iti.training.exam.model.entities.Attempt;
import com.iti.training.exam.model.entities.Course;
import com.iti.training.exam.model.vto.*;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

import java.math.BigDecimal;
import java.math.RoundingMode;


@Mapper(componentModel = "spring", uses = {ExamMapper.class, QuestionMapper.class})
public abstract class CourseMapper {

    public abstract CourseResponse toResponse(Course course);

    @Mapping(target = "courseId", ignore = true)
    public abstract Course toCourse(CourseDTO courseDTO);

    // Map to comprehensive CourseVTO
//    @Mapping(target = "questions", expression = "java(mapQuestionsToQuestionViews(course))")
//    @Mapping(target = "exams", expression = "java(mapExamsToExamViews(course))")
    @Mapping(target = "statistics", expression = "java(mapCourseStatistics(course))")
    public abstract CourseView toCourseView(Course course);

    // Map to summary view (if you still need it)
//    @Mapping(target = "totalExams", expression = "java(mapTotalExams(course))")
//    @Mapping(target = "totalQuestions", expression = "java(mapTotalQuestions(course))")
//    @Mapping(target = "mcqCount", expression = "java(mapMcqCount(course))")
//    @Mapping(target = "tfCount", expression = "java(mapTfCount(course))")
//    @Mapping(target = "averageGrade", expression = "java(mapAverageGrade(course))")
//    public abstract CourseExamSummaryView toCourseExamSummaryView(Course course);

    protected Integer mapTotalStudents(Course course) {
        if (course.getExams() == null) return 0;

        return (int) course.getExams().stream()
                .filter(exam -> exam.getAttempts() != null)
                .flatMap(exam -> exam.getAttempts().stream())
                .map(attempt -> attempt.getStudent().getSsn())
                .distinct()
                .count();
    }

    // Update the mapCourseStatistics method:
    protected CourseStatisticsView mapCourseStatistics(Course course) {
        return CourseStatisticsView.builder()
                .totalExams(mapTotalExams(course))
                .totalQuestions(mapTotalQuestions(course))
                .mcqCount(mapMcqCount(course))
                .tfCount(mapTfCount(course))
                .averageGrade(mapAverageGrade(course))
                .totalAttempts(mapTotalAttempts(course))
                .totalStudents(mapTotalStudents(course)) // Add this line
                .build();
    }

    // Statistics helper methods
    protected Integer mapTotalExams(Course course) {
        return course.getExams() != null ? course.getExams().size() : 0;
    }

    protected Integer mapTotalQuestions(Course course) {
        return course.getQuestions() != null ? course.getQuestions().size() : 0;
    }

    protected Integer mapMcqCount(Course course) {
        if (course.getQuestions() == null) return 0;
        return (int) course.getQuestions().stream()
                .filter(question -> "MCQ".equalsIgnoreCase(question.getType()))
                .count();
    }

    protected Integer mapTfCount(Course course) {
        if (course.getQuestions() == null) return 0;
        return (int) course.getQuestions().stream()
                .filter(question -> "TRUE_FALSE".equalsIgnoreCase(question.getType()))
                .count();
    }

    // In CourseMapper - update mapAverageGrade method
    protected BigDecimal mapAverageGrade(Course course) {
        if (course.getExams() == null) return BigDecimal.ZERO;

        return course.getExams().stream()
                .filter(exam -> exam != null && exam.getAttempts() != null)
                .flatMap(exam -> exam.getAttempts().stream())
                .filter(attempt -> attempt != null && attempt.getGrade() != null)
                .map(Attempt::getGrade)
                .reduce(BigDecimal.ZERO, BigDecimal::add)
                .divide(BigDecimal.valueOf(
                        course.getExams().stream()
                                .filter(exam -> exam != null && exam.getAttempts() != null)
                                .flatMap(exam -> exam.getAttempts().stream())
                                .filter(attempt -> attempt != null && attempt.getGrade() != null)
                                .count()
                ), 2, RoundingMode.HALF_UP);
    }

    protected Integer mapTotalAttempts(Course course) {
        if (course.getExams() == null) return 0;

        return course.getExams().stream()
                .filter(exam -> exam.getAttempts() != null)
                .mapToInt(exam -> exam.getAttempts().size())
                .sum();
    }
}
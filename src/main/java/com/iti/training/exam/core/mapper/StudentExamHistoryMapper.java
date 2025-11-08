package com.iti.training.exam.core.mapper;

import com.iti.training.exam.model.entities.Attempt;
import com.iti.training.exam.model.entities.Course;
import com.iti.training.exam.model.vto.StudentExamHistoryView;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.Named;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.Comparator;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Mapper(componentModel = "spring")
public interface StudentExamHistoryMapper {

    @Mapping(source = "student.ssn", target = "studentSsn")
    @Mapping(source = "student", target = "studentName", qualifiedByName = "mapStudentName")
    @Mapping(source = "exam.examId", target = "examId")
    @Mapping(source = "exam.title", target = "examTitle")
    @Mapping(source = "exam.course.courseName", target = "courseName")
    @Mapping(source = "attemptDate", target = "attemptDate")
    @Mapping(source = "grade", target = "grade")
    @Mapping(source = "grade", target = "status", qualifiedByName = "mapStatus")
    @Mapping(source = "exam.duration", target = "duration")
    @Mapping(source = ".", target = "totalQuestions", qualifiedByName = "mapTotalQuestions")
    @Mapping(source = ".", target = "correctAnswers", qualifiedByName = "mapCorrectAnswers")
    @Mapping(target = "attemptCount", ignore = true) // This will be set in the list method
    @Mapping(source = "exam.course", target = "courseAverage", qualifiedByName = "mapCourseAverage")
    StudentExamHistoryView toHistoryView(Attempt attempt);

    @Named("mapCourseAverage")
    default BigDecimal mapCourseAverage(Course course) {
        if (course == null || course.getExams() == null) return BigDecimal.ZERO;

        List<BigDecimal> grades = course.getExams().stream()
                .filter(exam -> exam.getAttempts() != null)
                .flatMap(exam -> exam.getAttempts().stream())
                .filter(attempt -> attempt.getGrade() != null)
                .map(Attempt::getGrade)
                .collect(Collectors.toList());

        if (grades.isEmpty()) {
            return BigDecimal.ZERO;
        }

        BigDecimal sum = grades.stream()
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        return sum.divide(BigDecimal.valueOf(grades.size()), 2, RoundingMode.HALF_UP);
    }

    @Named("mapStudentName")
    default String mapStudentName(com.iti.training.exam.model.entities.Student student) {
        if (student == null) {
            return "Unknown Student";
        }
        return student.getFirstName() + " " + student.getLastName();
    }

    @Named("mapStatus")
    default String mapStatus(Double grade) {
        if (grade == null) return "PENDING";
        return grade >= 60.0 ? "PASSED" : "FAILED";
    }

    @Named("mapTotalQuestions")
    default Integer mapTotalQuestions(Attempt attempt) {
        return attempt.getAnswers() != null ? attempt.getAnswers().size() : 0;
    }

    @Named("mapCorrectAnswers")
    default Integer mapCorrectAnswers(Attempt attempt) {
        if (attempt.getAnswers() == null) return 0;
        return (int) attempt.getAnswers().stream()
                .filter(answer -> Boolean.TRUE.equals(answer.getIsCorrect()))
                .count();
    }

    /**
     * Convert list of attempts to history views with all calculated fields
     */
    default List<StudentExamHistoryView> toHistoryViews(List<Attempt> attempts) {
        if (attempts == null || attempts.isEmpty()) {
            return List.of();
        }

        // Calculate attempt counts per student per exam
        Map<String, Map<Integer, Long>> attemptCounts = attempts.stream()
                .collect(Collectors.groupingBy(
                        attempt -> attempt.getStudent().getSsn(),
                        Collectors.groupingBy(
                                attempt -> attempt.getExam().getExamId(),
                                Collectors.counting()
                        )
                ));

        return attempts.stream()
                .sorted(Comparator.comparing(Attempt::getAttemptDate).reversed())
                .map(attempt -> {
                    StudentExamHistoryView view = toHistoryView(attempt);

                    // Set attempt count
                    Long count = attemptCounts
                            .getOrDefault(attempt.getStudent().getSsn(), Map.of())
                            .getOrDefault(attempt.getExam().getExamId(), 0L);
                    view.setAttemptCount(count);

                    return view;
                })
                .collect(Collectors.toList());
    }

    /**
     * Alternative method to get best attempts per exam (highest grade)
     */
    default List<StudentExamHistoryView> toBestAttemptsHistoryViews(List<Attempt> attempts) {
        if (attempts == null || attempts.isEmpty()) {
            return List.of();
        }

        // Group by student and exam, then take the best attempt (highest grade)
        List<Attempt> bestAttempts = attempts.stream()
                .collect(Collectors.groupingBy(
                        attempt -> attempt.getStudent().getSsn() + "-" + attempt.getExam().getExamId(),
                        Collectors.collectingAndThen(
                                Collectors.toList(),
                                attemptList -> attemptList.stream()
                                        .max(Comparator.comparing(attempt ->
                                                attempt.getGrade() != null ? attempt.getGrade() : BigDecimal.ZERO))
                                        .orElse(null)
                        )
                ))
                .values()
                .stream()
                .filter(attempt -> attempt != null)
                .sorted(Comparator.comparing(Attempt::getAttemptDate).reversed())
                .collect(Collectors.toList());

        return toHistoryViews(bestAttempts);
    }

    /**
     * Method to get latest attempts per exam (most recent)
     */
    default List<StudentExamHistoryView> toLatestAttemptsHistoryViews(List<Attempt> attempts) {
        if (attempts == null || attempts.isEmpty()) {
            return List.of();
        }

        // Group by student and exam, then take the latest attempt
        List<Attempt> latestAttempts = attempts.stream()
                .collect(Collectors.groupingBy(
                        attempt -> attempt.getStudent().getSsn() + "-" + attempt.getExam().getExamId(),
                        Collectors.collectingAndThen(
                                Collectors.toList(),
                                attemptList -> attemptList.stream()
                                        .max(Comparator.comparing(Attempt::getAttemptDate))
                                        .orElse(null)
                        )
                ))
                .values()
                .stream()
                .filter(attempt -> attempt != null)
                .sorted(Comparator.comparing(Attempt::getAttemptDate).reversed())
                .collect(Collectors.toList());

        return toHistoryViews(latestAttempts);
    }
}
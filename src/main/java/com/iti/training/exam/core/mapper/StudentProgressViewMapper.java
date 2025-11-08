package com.iti.training.exam.core.mapper;

import com.iti.training.exam.model.entities.Attempt;
import com.iti.training.exam.model.entities.Student;
import com.iti.training.exam.model.vto.StudentProgressView;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.Named;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.Comparator;
import java.util.List;

@Mapper(componentModel = "spring")
public interface StudentProgressViewMapper {

    @Mapping(source = "ssn", target = "ssn")
    @Mapping(target = "studentName", expression = "java(mapStudentName(student))")
    @Mapping(source = "attempts", target = "trackName", qualifiedByName = "mapCourseName")
    @Mapping(source = "attempts", target = "totalExamsTaken", qualifiedByName = "mapTotalExamsTaken")
    @Mapping(source = "attempts", target = "passedExams", qualifiedByName = "mapPassedExams")
    @Mapping(source = "attempts", target = "overallAverage", qualifiedByName = "mapOverallAverage")
    @Mapping(source = "attempts", target = "recentGrade", qualifiedByName = "mapRecentGrade")
    @Mapping(source = "attempts", target = "status", qualifiedByName = "mapStatus")
    StudentProgressView toProgressView(Student student);

    default String mapStudentName(Student student) {
        if (student == null) {
            return "Unknown Student";
        }
        return student.getFirstName() + " " + student.getLastName();
    }

    @Named("mapCourseName")
    default String mapCourseName(List<Attempt> attempts) {
        if (attempts == null || attempts.isEmpty()) {
            return "No Course Assigned";
        }

        // Get the most recent attempt and return its course name
        return attempts.stream()
                .max(Comparator.comparing(Attempt::getAttemptDate))
                .map(attempt -> attempt.getExam().getCourse().getCourseName())
                .orElse("No Course Assigned");
    }

    @Named("mapTotalExamsTaken")
    default Integer mapTotalExamsTaken(List<Attempt> attempts) {
        if (attempts == null) {
            return 0;
        }

        // Count distinct exams taken (in case student retook same exam)
        Long distinctExams = attempts.stream()
                .map(attempt -> attempt.getExam().getExamId())
                .distinct()
                .count();
        return  distinctExams.intValue();
    }

    @Named("mapPassedExams")
    default Integer mapPassedExams(List<Attempt> attempts) {
        if (attempts == null) {
            return 0;
        }

        // Get the best attempt for each exam and count passed ones
        Long passedExams = attempts.stream()
                .collect(java.util.stream.Collectors.groupingBy(
                        attempt -> attempt.getExam().getExamId(),
                        java.util.stream.Collectors.maxBy(Comparator.comparing(Attempt::getGrade))
                ))
                .values()
                .stream()
                .filter(optional -> optional.isPresent() && optional.get().getGrade() != null)
                .map(optional -> optional.get().getGrade())
                .filter(grade -> grade.compareTo(new BigDecimal("60.0")) >= 0)
                .count();
        return passedExams.intValue();
    }

    @Named("mapOverallAverage")
    default Double mapOverallAverage(List<Attempt> attempts) {
        if (attempts == null || attempts.isEmpty()) {
            return 0.0;
        }

        // Calculate average of all attempts
        return attempts.stream()
                .filter(attempt -> attempt.getGrade() != null)
                .mapToDouble(attempt -> attempt.getGrade().doubleValue()) // Convert BigDecimal to double
                .average()
                .orElse(0.0);
    }

    @Named("mapRecentGrade")
    default Double mapRecentGrade(List<Attempt> attempts) {
        if (attempts == null || attempts.isEmpty()) {
            return 0.0;
        }

        // Get the most recent attempt grade
        return attempts.stream()
                .filter(attempt -> attempt.getGrade() != null)
                .map(Attempt::getGrade)
                .reduce(BigDecimal.ZERO, BigDecimal::add)
                .divide(attempts.stream()
                                .filter(attempt -> attempt.getGrade() != null)
                                .count() > 0 ?
                                BigDecimal.valueOf(attempts.stream()
                                        .filter(attempt -> attempt.getGrade() != null)
                                        .count()) :
                                BigDecimal.ONE,
                        2, RoundingMode.HALF_UP)
                .doubleValue();
    }

    @Named("mapStatus")
    default String mapStatus(List<Attempt> attempts) {
        if (attempts == null || attempts.isEmpty()) {
            return "No Attempts";
        }

        double overallAverage = mapOverallAverage(attempts);
        int passedExams = mapPassedExams(attempts);
        int totalExams = mapTotalExamsTaken(attempts);

        if (totalExams == 0) {
            return "No Exams Taken";
        }

        double passRate = (double) passedExams / totalExams * 100;

        if (passRate >= 80.0 && overallAverage >= 70.0) {
            return "EXCELLENT";
        } else if (passRate >= 60.0 && overallAverage >= 60.0) {
            return "GOOD";
        } else if (passRate >= 50.0) {
            return "AVERAGE";
        } else {
            return "NEEDS IMPROVEMENT";
        }
    }
}
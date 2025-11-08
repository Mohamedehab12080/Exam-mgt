package com.iti.training.exam.model.vto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CourseStatisticsView {
    private Integer totalExams;
    private Integer totalQuestions;
    private Integer mcqCount;
    private Integer tfCount;
    private BigDecimal averageGrade;
    private Integer totalAttempts;
    private Integer totalStudents; // Count unique students
}
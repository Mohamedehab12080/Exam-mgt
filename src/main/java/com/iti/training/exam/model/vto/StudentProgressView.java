package com.iti.training.exam.model.vto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class StudentProgressView {
    private String ssn;
    private String studentName;
    private String trackName;
    private Integer totalExamsTaken;
    private Integer passedExams;
    private Double overallAverage;
    private Double recentGrade;
    private String status;
}
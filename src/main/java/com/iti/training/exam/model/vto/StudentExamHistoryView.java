package com.iti.training.exam.model.vto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDate;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class StudentExamHistoryView {
    private String studentSsn;
    private String studentName;
    private Integer examId;
    private String examTitle;
    private String courseName;
    private LocalDate attemptDate;
    private Double grade;
    private Long attemptCount;
    private String status; // PASSED/FAILED
    private Double courseAverage; // For comparison
    private Integer duration; // Exam duration in minutes
    private Integer totalQuestions;
    private Integer correctAnswers;
}
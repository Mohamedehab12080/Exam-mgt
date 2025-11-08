package com.iti.training.exam.model.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDate;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AttemptResponse {
    private Integer attemptId;
    private String studentSsn;
    private String studentName;
    private Integer examId;
    private String examTitle;
    private LocalDate attemptDate;
    private Double grade;
}
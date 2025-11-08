package com.iti.training.exam.model.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ExamResultResponse {
    private Integer attemptId;
    private Integer examId;
    private Double grade;
    private String resultMessage;
}
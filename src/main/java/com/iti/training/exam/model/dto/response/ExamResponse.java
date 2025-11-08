package com.iti.training.exam.model.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ExamResponse {
    private String message;
    private String courseName;
    private String title;
    private Integer duration;
    private Integer numMcq;
    private Integer numTf;
}
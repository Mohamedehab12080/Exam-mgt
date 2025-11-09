package com.iti.training.exam.model.dto;

import lombok.Data;
import jakarta.validation.constraints.*;

@Data
public class ExamDTO {
    private Integer courseId;
    private Integer duration;
    private String title;
    private Integer numMcq;
    private Integer numTf;
}
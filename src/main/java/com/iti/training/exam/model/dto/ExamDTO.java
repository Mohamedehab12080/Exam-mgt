package com.iti.training.exam.model.dto;

import lombok.Data;
import jakarta.validation.constraints.*;

@Data
public class ExamDTO {
    @NotBlank(message = "Course Id is required")
    private Integer courseId;

    @NotNull(message = "Duration is required")
    @Min(value = 11, message = "Duration must be greater than 10 minutes")
    private Integer duration;

    @NotBlank(message = "Title is required")
    private String title;

    @NotNull(message = "Number of MCQ questions is required")
    @Min(value = 1, message = "At least 1 MCQ question is required")
    private Integer numMcq;

    @NotNull(message = "Number of True/False questions is required")
    @Min(value = 1, message = "At least 1 True/False question is required")
    private Integer numTf;
}
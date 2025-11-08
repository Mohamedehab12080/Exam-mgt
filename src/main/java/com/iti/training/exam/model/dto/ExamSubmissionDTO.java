package com.iti.training.exam.model.dto;

import lombok.Data;
import jakarta.validation.constraints.*;
import java.util.List;

@Data
public class ExamSubmissionDTO {
    @NotBlank(message = "SSN is required")
    @Pattern(regexp = "\\d{14}", message = "SSN must be 14 digits")
    private String ssn;

    @NotNull(message = "Exam ID is required")
    private Integer examId;

    @NotEmpty(message = "Answers cannot be empty")
    private List<String> answers;
}
package com.iti.training.exam.model.dto;


import lombok.Data;
import jakarta.validation.constraints.*;

@Data
public class QuestionDTO {
    @NotNull(message = "Course ID is required")
    private Integer courseId;

    @NotBlank(message = "Question type is required")
    @Pattern(regexp = "MCQ|T/F", message = "Type must be either 'MCQ' or 'T/F'")
    private String type;

    @NotBlank(message = "Question text is required")
    @Size(max = 500, message = "Question text cannot exceed 500 characters")
    private String questionText;
}
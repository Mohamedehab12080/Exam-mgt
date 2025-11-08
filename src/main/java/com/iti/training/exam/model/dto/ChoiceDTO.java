package com.iti.training.exam.model.dto;

import lombok.Data;
import jakarta.validation.constraints.*;

@Data
public class ChoiceDTO {
    @NotNull(message = "Question ID is required")
    private Integer questionId;

    @NotBlank(message = "Choice text is required")
    @Size(max = 300, message = "Choice text cannot exceed 300 characters")
    private String choiceText;

    @NotNull(message = "IsCorrect flag is required")
    private Boolean isCorrect;
}
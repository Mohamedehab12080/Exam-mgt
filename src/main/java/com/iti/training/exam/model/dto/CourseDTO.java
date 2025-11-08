package com.iti.training.exam.model.dto;

import lombok.Data;
import jakarta.validation.constraints.*;

@Data
public class CourseDTO {
    @NotBlank(message = "Course name is required")
    @Size(max = 100, message = "Course name cannot exceed 100 characters")
    private String courseName;

    @NotNull(message = "Duration is required")
    @Min(value = 1, message = "Duration must be at least 1")
    private Integer duration;
}

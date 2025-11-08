package com.iti.training.exam.model.filter;

import com.iti.training.api.repository.model.SearchFilter;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.NoArgsConstructor;
import lombok.experimental.SuperBuilder;

@Data
@SuperBuilder
@EqualsAndHashCode(callSuper = true)
@NoArgsConstructor
@AllArgsConstructor
public class CourseSearchFilter extends SearchFilter {
    private String courseName;
    private Integer duration;
    private Integer minDuration;
    private Integer maxDuration;
    private Boolean hasExams;
    private Boolean hasQuestions;
}
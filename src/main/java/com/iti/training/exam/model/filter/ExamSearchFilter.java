package com.iti.training.exam.model.filter;

import com.iti.training.api.repository.model.SearchFilter;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.NoArgsConstructor;
import lombok.experimental.SuperBuilder;
import java.time.LocalDate;

@Data
@SuperBuilder
@EqualsAndHashCode(callSuper = true)
@NoArgsConstructor
@AllArgsConstructor
public class ExamSearchFilter extends SearchFilter {
    private String title;
    private Integer courseId;
    private LocalDate examDate;
    private LocalDate startDate;
    private LocalDate endDate;
    private Integer duration;
    private Integer minDuration;
    private Integer maxDuration;
}
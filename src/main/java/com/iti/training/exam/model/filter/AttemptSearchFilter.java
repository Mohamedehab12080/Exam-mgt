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
public class AttemptSearchFilter extends SearchFilter {
    private String studentSsn;
    private Integer examId;
    private LocalDate attemptDate;
    private LocalDate startDate;
    private LocalDate endDate;
    private Double minGrade;
    private Double maxGrade;
}
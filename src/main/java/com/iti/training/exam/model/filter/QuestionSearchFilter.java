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
public class QuestionSearchFilter extends SearchFilter {
    private Integer courseId;
    private String type;
    private String questionText;
    private Boolean hasChoices;
    private Integer minChoiceCount;
}
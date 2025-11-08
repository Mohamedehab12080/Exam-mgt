package com.iti.training.exam.model.vto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class QuestionSummary {
    private Integer questionId;
    private String type;
    private String questionText;
}
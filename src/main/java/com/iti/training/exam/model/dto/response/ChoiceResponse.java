package com.iti.training.exam.model.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ChoiceResponse {
    private Integer choiceId;
    private Integer questionId;
    private String choiceText;
    private Boolean isCorrect;
}
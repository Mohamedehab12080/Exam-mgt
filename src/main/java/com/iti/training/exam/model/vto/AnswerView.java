package com.iti.training.exam.model.vto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AnswerView {
    private ChoiceView choice;
    private QuestionView question;
    private Integer attemptId;
    private Boolean isCorrect;
}
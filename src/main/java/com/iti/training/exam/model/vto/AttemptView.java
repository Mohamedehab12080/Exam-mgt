package com.iti.training.exam.model.vto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AttemptView {
    private Integer attemptId;
    private ExamView exam;
    private LocalDate attemptDate;
    private BigDecimal grade;
    private Integer answerCount;
    private List<AnswerView> answers;
}
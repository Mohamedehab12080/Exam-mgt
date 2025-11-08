package com.iti.training.exam.model.vto;

import com.iti.training.exam.model.entities.Attempt;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDate;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ExamView {
    private Integer examId;
    private String title;
    private LocalDate examDate;
    private Integer duration;
    private String courseName;
    private List<QuestionView> questions;
}
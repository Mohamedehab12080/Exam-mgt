package com.iti.training.exam.model.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class QuestionResponse {
    private Integer questionId;
    private Integer courseId;
    private String courseName;
    private String type;
    private String questionText;
    private List<ChoiceResponse> choices;
}
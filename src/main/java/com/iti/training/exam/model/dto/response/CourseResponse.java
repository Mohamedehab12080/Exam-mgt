package com.iti.training.exam.model.dto.response;

import com.iti.training.exam.model.vto.QuestionSummary;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CourseResponse {
    private Integer courseId;
    private String courseName;
    private Integer duration;
    private List<QuestionSummary> questions;
}
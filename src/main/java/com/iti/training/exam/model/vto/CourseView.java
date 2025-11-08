package com.iti.training.exam.model.vto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CourseView {
    private Integer courseId;
    private String courseName;
    private Integer duration;
    private List<QuestionView> questions;
    private List<ExamView> exams;
    private CourseStatisticsView statistics;
}
package com.iti.training.api.repository;
import com.iti.training.exam.model.entities.Exam;
import com.iti.training.exam.model.filter.ExamSearchFilter;

import java.util.List;

public interface ExamRepository {
    void createExamWithRandomQuestions(String courseName, Integer duration,
                                       String title, Integer numMcq, Integer numTf);

    ExamSubmissionResult submitExam(String ssn, Integer examId, List<String> answers);

    record ExamSubmissionResult(Integer attemptId, Integer examId, Double grade, String resultMessage) {}

    List<Exam> selectAllByFilters(ExamSearchFilter filter);
    long countByFilters(ExamSearchFilter filter);
}
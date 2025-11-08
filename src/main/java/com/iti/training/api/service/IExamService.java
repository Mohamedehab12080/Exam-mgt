package com.iti.training.api.service;

import com.iti.training.exam.core.controller.config.ApiResponse;
import com.iti.training.exam.model.dto.ExamDTO;
import com.iti.training.exam.model.dto.ExamSubmissionDTO;
import com.iti.training.exam.model.dto.response.ExamResponse;
import com.iti.training.exam.model.dto.response.ExamResultResponse;
import com.iti.training.exam.model.filter.ExamSearchFilter;
import com.iti.training.exam.model.vto.ExamView;

import java.util.List;

public interface IExamService {
    ApiResponse<ExamResponse> createExam(ExamDTO examDTO);
    ApiResponse<ExamResultResponse> submitExam(ExamSubmissionDTO examSubmissionDTO);
    ApiResponse<List<ExamView>> getAllByFilters(ExamSearchFilter filter);
    ApiResponse<Long> countByFilters(ExamSearchFilter filter);

}
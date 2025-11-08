package com.iti.training.api.service;

import com.iti.training.exam.core.controller.config.ApiResponse;
import com.iti.training.exam.model.dto.QuestionDTO;
import com.iti.training.exam.model.dto.response.QuestionResponse;
import com.iti.training.exam.model.filter.QuestionSearchFilter;

import java.util.List;

public interface IQuestionService {
    ApiResponse<QuestionResponse> createQuestion(QuestionDTO questionDTO);
    ApiResponse<QuestionResponse> getQuestionById(Integer questionId);
    ApiResponse<Void> deleteQuestion(Integer questionId);
    ApiResponse<List<QuestionResponse>> getAllByFilters(QuestionSearchFilter filter);
    ApiResponse<Long> countByFilters(QuestionSearchFilter filter);

}
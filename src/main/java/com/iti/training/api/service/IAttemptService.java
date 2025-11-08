package com.iti.training.api.service;

import com.iti.training.exam.core.controller.config.ApiResponse;
import com.iti.training.exam.model.dto.response.AttemptResponse;
import com.iti.training.exam.model.filter.AttemptSearchFilter;
import com.iti.training.exam.model.vto.AttemptView;

import java.util.List;

public interface IAttemptService {
    ApiResponse<AttemptView> getAttemptById(Integer attemptId);// Search operations
    ApiResponse<List<AttemptView>> getAllByFilters(AttemptSearchFilter filter);
    ApiResponse<Long> countByFilters(AttemptSearchFilter filter);
}
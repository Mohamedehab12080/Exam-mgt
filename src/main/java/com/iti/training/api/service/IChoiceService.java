package com.iti.training.api.service;

import com.iti.training.exam.core.controller.config.ApiResponse;
import com.iti.training.exam.model.dto.ChoiceDTO;
import com.iti.training.exam.model.dto.response.ChoiceResponse;
import com.iti.training.exam.model.filter.ChoiceSearchFilter;

import java.util.List;
public interface IChoiceService {
    ApiResponse<ChoiceResponse> createChoice(ChoiceDTO choiceDTO);
    ApiResponse<List<ChoiceResponse>> getAllByFilters(ChoiceSearchFilter filter);
    ApiResponse<Long> countByFilters(ChoiceSearchFilter filter);
    ApiResponse<ChoiceResponse> updateChoice(Integer choiceId, ChoiceDTO choiceDTO);
    ApiResponse<Void> deleteChoice(Integer choiceId);
}
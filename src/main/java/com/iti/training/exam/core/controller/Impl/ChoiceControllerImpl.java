package com.iti.training.exam.core.controller.Impl;

import com.iti.training.api.repository.model.PaginationInfo;
import com.iti.training.api.repository.model.SortingInfo;
import com.iti.training.api.service.IChoiceService;
import com.iti.training.exam.core.controller.config.ApiResponse;
import com.iti.training.exam.core.controller.generated.choice.ChoicesController;
import com.iti.training.exam.model.dto.ChoiceDTO;
import com.iti.training.exam.model.filter.ChoiceSearchFilter;
import com.iti.training.exam.model.generated.choice.ChoiceSortBy;
import com.iti.training.exam.model.generated.choice.OrderDir;
import lombok.AllArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.RestController;

@RestController
@AllArgsConstructor
public class ChoiceControllerImpl implements ChoicesController {

    private final IChoiceService choiceService;

    @Override
    public ResponseEntity<ApiResponse> _countChoices(Integer questionId, Boolean isCorrect) {
        ChoiceSearchFilter filter = ChoiceSearchFilter.builder()
                .questionId(questionId)
                .isCorrect(isCorrect)
                .pagination(PaginationInfo.noPagination())
                .build();

        ApiResponse response = choiceService.countByFilters(filter);
        return ResponseEntity.status(response.getStatus()).body(response);
    }

    @Override
    public ResponseEntity<ApiResponse> _createChoice(ChoiceDTO choiceDTO) {
        ApiResponse response = choiceService.createChoice(choiceDTO);
        return ResponseEntity.status(response.getStatus()).body(response);
    }

    @Override
    public ResponseEntity<ApiResponse> _deleteChoice(Integer choiceId) {
        ApiResponse response = choiceService.deleteChoice(choiceId);
        return ResponseEntity.status(response.getStatus()).body(response);
    }


    @Override
    public ResponseEntity<ApiResponse> _getChoices(Integer questionId, String choiceText, Boolean isCorrect, Integer page, Integer size, ChoiceSortBy sortBy, OrderDir sortDir) {

        ChoiceSearchFilter filter = ChoiceSearchFilter.builder()
                .questionId(questionId)
                .choiceText(choiceText)
                .isCorrect(isCorrect)
                .pagination(PaginationInfo.builder()
                        .pageNum(page)
                        .pageSize(size)
                        .build())
                .sorting(SortingInfo.builder()
                        .by(sortBy.getValue())
                        .dir(sortDir.getValue())
                        .build())
                .build();

        ApiResponse response = choiceService.getAllByFilters(filter);
        return ResponseEntity.status(response.getStatus()).body(response);
    }

    @Override
    public ResponseEntity<ApiResponse> _updateChoice(Integer choiceId, ChoiceDTO choiceDTO) {
        ApiResponse response = choiceService.updateChoice(choiceId, choiceDTO);
        return ResponseEntity.status(response.getStatus()).body(response);
    }
}
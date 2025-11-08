package com.iti.training.exam.core.controller.Impl;

import com.iti.training.api.service.IAttemptService;
import com.iti.training.exam.core.controller.config.ApiResponse;
import com.iti.training.exam.core.controller.generated.attempt.AttemptsController;
import com.iti.training.exam.model.filter.AttemptSearchFilter;
import com.iti.training.api.repository.model.PaginationInfo;
import com.iti.training.api.repository.model.SortingInfo;
import lombok.AllArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.RestController;

import java.time.LocalDate;

@RestController
@AllArgsConstructor
public class AttemptControllerImpl implements AttemptsController {

    private final IAttemptService attemptService;

    @Override
    public ResponseEntity<ApiResponse> _countAttempts(String studentSsn, Integer examId) {
        AttemptSearchFilter filter = AttemptSearchFilter.builder()
                .studentSsn(studentSsn)
                .examId(examId != null ? examId.intValue() : null)
                .pagination(PaginationInfo.noPagination())
                .build();
        ApiResponse response = attemptService.countByFilters(filter);
        return ResponseEntity.status(response.getStatus()).body(response);
    }

    @Override
    public ResponseEntity<ApiResponse> _getAttemptById(Integer attemptId) {
        ApiResponse response = attemptService.getAttemptById(attemptId != null ? attemptId.intValue() : null);
        return ResponseEntity.status(response.getStatus()).body(response);
    }

    @Override
    public ResponseEntity<ApiResponse> _getAttempts(String studentSsn, Integer examId, LocalDate attemptDate, Integer page, Integer size, String sort) {
        PaginationInfo pagination = null;
        if (page != null || size != null) {
            pagination = PaginationInfo.builder()
                    .pageNum(page != null ? page : 0)
                    .pageSize(size != null ? size : 25)
                    .build();
        }

        SortingInfo sorting = null;
        if (sort != null) {
            String[] sortParts = sort.split(",");
            sorting = SortingInfo.builder()
                    .by(sortParts[0])
                    .dir(sortParts.length > 1 ? sortParts[1] : "ASC")
                    .build();
        }

        AttemptSearchFilter filter = AttemptSearchFilter.builder()
                .studentSsn(studentSsn)
                .examId(examId != null ? examId.intValue() : null)
                .attemptDate(attemptDate)
                .pagination(pagination)
                .sorting(sorting)
                .build();

        ApiResponse response = attemptService.getAllByFilters(filter);
        return ResponseEntity.status(response.getStatus()).body(response);
    }
}
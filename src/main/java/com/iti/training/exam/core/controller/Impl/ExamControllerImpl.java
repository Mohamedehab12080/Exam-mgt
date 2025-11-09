package com.iti.training.exam.core.controller.Impl;

import com.iti.training.api.repository.model.PaginationInfo;
import com.iti.training.api.repository.model.SortingInfo;
import com.iti.training.api.service.IExamService;
import com.iti.training.exam.core.controller.config.ApiResponse;
import com.iti.training.exam.core.controller.generated.exam.ExamsController;
import com.iti.training.exam.model.dto.ExamDTO;
import com.iti.training.exam.model.dto.ExamSubmissionDTO;
import com.iti.training.exam.model.filter.ExamSearchFilter;
import com.iti.training.exam.model.generated.exam.ExamSortBy;
import com.iti.training.exam.model.generated.exam.OrderDir;
import lombok.AllArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.RestController;

import java.time.LocalDate;

@RestController
@AllArgsConstructor
public class ExamControllerImpl implements ExamsController {

    private final IExamService examService;

    @Override
    public ResponseEntity<ApiResponse> _countExams(Integer courseId, LocalDate startDate) {
        ExamSearchFilter filter = ExamSearchFilter.builder()
                .courseId(courseId)
                .startDate(startDate)
                .build();

        ApiResponse response = examService.countByFilters(filter);
        return ResponseEntity.status(response.getStatus()).body(response);
    }

    @Override
    public ResponseEntity<ApiResponse> _createExam(ExamDTO examDTO) {
        ApiResponse response = examService.createExam(examDTO);
        return ResponseEntity.status(response.getStatus()).body(response);
    }

    @Override
    public ResponseEntity<ApiResponse> _getExams(String title, Integer courseId, LocalDate examDate, LocalDate startDate, LocalDate endDate, Integer duration, Integer minDuration, Integer maxDuration, Integer page, Integer size, ExamSortBy sortBy, OrderDir sortDir) {

        // Fix: Handle null sorting parameters
        SortingInfo sortingInfo = null;
        if (sortBy != null) {
            sortingInfo = SortingInfo.builder()
                    .by(sortBy.getValue())
                    .dir(sortDir != null ? sortDir.getValue() : "ASC")
                    .build();
        }

        ExamSearchFilter filter = ExamSearchFilter.builder()
                .title(title)
                .courseId(courseId)
                .examDate(examDate)
                .startDate(startDate)
                .endDate(endDate)
                .duration(duration)
                .minDuration(minDuration)
                .maxDuration(maxDuration)
                .sorting(sortingInfo) // This can be null now
                .pagination(PaginationInfo.builder()
                        .pageSize(size != null ? size : 25)
                        .pageNum(page != null ? page : 0)
                        .build())
                .build();

        ApiResponse response = examService.getAllByFilters(filter);
        return ResponseEntity.status(response.getStatus()).body(response);
    }

    @Override
    public ResponseEntity<ApiResponse> _submitExam(ExamSubmissionDTO examSubmissionDTO) {
        ApiResponse response = examService.submitExam(examSubmissionDTO);
        return ResponseEntity.status(response.getStatus()).body(response);
    }
}
package com.iti.training.exam.core.controller.Impl;

import com.iti.training.api.repository.model.PaginationInfo;
import com.iti.training.api.repository.model.SortingInfo;
import com.iti.training.api.service.IQuestionService;
import com.iti.training.exam.core.controller.config.ApiResponse;
import com.iti.training.exam.core.controller.generated.question.QuestionsController;
import com.iti.training.exam.model.dto.QuestionDTO;
import com.iti.training.exam.model.filter.QuestionSearchFilter;
import lombok.AllArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.RestController;

@RestController
@AllArgsConstructor
public class QuestionControllerImpl implements QuestionsController {

    private final IQuestionService questionService;

    @Override
    public ResponseEntity<ApiResponse> _countQuestions(Integer courseId, String type) {
        QuestionSearchFilter filter = QuestionSearchFilter.builder()
                .courseId(courseId)
                .type(type)
                .build();

        ApiResponse response = questionService.countByFilters(filter);
        return ResponseEntity.status(response.getStatus()).body(response);
    }

    @Override
    public ResponseEntity<ApiResponse> _createQuestion(QuestionDTO questionDTO) {
        ApiResponse response = questionService.createQuestion(questionDTO);
        return ResponseEntity.status(response.getStatus()).body(response);
    }

    @Override
    public ResponseEntity<ApiResponse> _deleteQuestion(Integer questionId) {
        ApiResponse response = questionService.deleteQuestion(questionId);
        return ResponseEntity.status(response.getStatus()).body(response);
    }

    @Override
    public ResponseEntity<ApiResponse> _getQuestionById(Integer questionId) {
        ApiResponse response = questionService.getQuestionById(questionId);
        return ResponseEntity.status(response.getStatus()).body(response);
    }

    @Override
    public ResponseEntity<ApiResponse> _getQuestions(Integer courseId, String type, String questionText, Boolean hasChoices, Integer minChoiceCount, Integer page, Integer size, String sort) {

        SortingInfo sorting = null;
        if (sort != null) {
            String[] sortParts = sort.split(",");
            sorting = SortingInfo.builder()
                    .by(sortParts[0])
                    .dir(sortParts.length > 1 ? sortParts[1] : "ASC")
                    .build();
        }
        QuestionSearchFilter filter = QuestionSearchFilter.builder()
                .courseId(courseId)
                .type(type)
                .questionText(questionText)
                .hasChoices(hasChoices)
                .minChoiceCount(minChoiceCount)
                .sorting(sorting)
                .pagination(PaginationInfo.builder().pageSize(size).pageNum(page).build())
                .build();

        ApiResponse response = questionService.getAllByFilters(filter);
        return ResponseEntity.status(response.getStatus()).body(response);
    }
}
package com.iti.training.exam.core.controller.Impl;

import com.iti.training.api.repository.model.PaginationInfo;
import com.iti.training.api.repository.model.SortingInfo;
import com.iti.training.api.service.IQuestionService;
import com.iti.training.exam.core.controller.config.ApiResponse;
import com.iti.training.exam.core.controller.generated.question.QuestionsController;
import com.iti.training.exam.model.dto.QuestionDTO;
import com.iti.training.exam.model.filter.QuestionSearchFilter;
import com.iti.training.exam.model.generated.question.OrderDir;
import com.iti.training.exam.model.generated.question.QuestionSortBy;
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
    public ResponseEntity<ApiResponse> _getQuestions(Integer courseId, String type, String questionText, Boolean hasChoices, Integer minChoiceCount, Integer page, Integer size, QuestionSortBy sortBy, OrderDir sortDir) {

        QuestionSearchFilter filter = QuestionSearchFilter.builder()
                .courseId(courseId)
                .type(type)
                .questionText(questionText)
                .hasChoices(hasChoices)
                .minChoiceCount(minChoiceCount)
                .sorting(SortingInfo.builder()
                        .by(sortBy.getValue())
                        .dir(sortDir.getValue())
                        .build())
                .pagination(PaginationInfo.builder().pageSize(size).pageNum(page).build())
                .build();

        ApiResponse response = questionService.getAllByFilters(filter);
        return ResponseEntity.status(response.getStatus()).body(response);
    }
}
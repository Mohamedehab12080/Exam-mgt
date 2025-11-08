package com.iti.training.exam.core.service;

import com.iti.training.api.service.IQuestionService;
import com.iti.training.exam.core.controller.config.ApiResponse;
import com.iti.training.exam.core.mapper.QuestionMapper;
import com.iti.training.exam.model.dto.QuestionDTO;
import com.iti.training.exam.model.dto.response.QuestionResponse;
import com.iti.training.exam.model.entities.Question;
import com.iti.training.exam.model.filter.QuestionSearchFilter;
import com.iti.training.api.repository.QuestionRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;
@Slf4j
@Service
@RequiredArgsConstructor
public class QuestionServiceImpl implements IQuestionService {

    private final QuestionRepository questionRepository;
    private final QuestionMapper questionMapper;

    @Override
    @Transactional
    public ApiResponse<QuestionResponse> createQuestion(QuestionDTO questionDTO) {
        try {
            log.info("Creating question for course ID: {}", questionDTO.getCourseId());

            Question question = questionMapper.toQuestion(questionDTO);
            Question savedQuestion = questionRepository.insert(question);

            log.info("Question created with ID: {}", savedQuestion.getQuestionId());

            QuestionResponse response = questionMapper.toResponse(savedQuestion);
            return ApiResponse.created("Question created successfully", response);

        } catch (Exception e) {
            log.error("Error creating question: {}", e.getMessage());
            return ApiResponse.error("Failed to create question: " + e.getMessage());
        }
    }

    @Override
    @Transactional(readOnly = true)
    public ApiResponse<QuestionResponse> getQuestionById(Integer questionId) {
        try {
            log.info("Fetching question by ID: {}", questionId);

            Question question = questionRepository.selectById(questionId)
                    .orElseThrow(() -> new RuntimeException("Question not found with ID: " + questionId));

            QuestionResponse response = questionMapper.toResponse(question);
            return ApiResponse.success("Question retrieved successfully", response);

        } catch (Exception e) {
            log.error("Error fetching question by ID {}: {}", questionId, e.getMessage());
            return ApiResponse.notFound("Failed to fetch question: " + e.getMessage());
        }
    }

    @Override
    @Transactional
    public ApiResponse<Void> deleteQuestion(Integer questionId) {
        try {
            log.info("Deleting question with ID: {}", questionId);

            if (!questionRepository.existsById(questionId)) {
                return ApiResponse.notFound("Question not found with ID: " + questionId);
            }

            questionRepository.deleteById(questionId);
            log.info("Question deleted successfully");

            return ApiResponse.success("Question deleted successfully", null);

        } catch (Exception e) {
            log.error("Error deleting question with ID {}: {}", questionId, e.getMessage());
            return ApiResponse.error("Failed to delete question: " + e.getMessage());
        }
    }

    @Override
    @Transactional(readOnly = true)
    public ApiResponse<List<QuestionResponse>> getAllByFilters(QuestionSearchFilter filter) {
        try {
            log.info("Fetching questions with filters");

            List<Question> questions = questionRepository.selectAllByFilters(filter);
            List<QuestionResponse> responses = questions.stream()
                    .map(questionMapper::toResponse)
                    .collect(Collectors.toList());

            return ApiResponse.success("Questions retrieved successfully", responses);

        } catch (Exception e) {
            log.error("Error fetching questions with filters: {}", e.getMessage());
            return ApiResponse.internalError("Failed to fetch questions: " + e.getMessage());
        }
    }

    @Override
    @Transactional(readOnly = true)
    public ApiResponse<Long> countByFilters(QuestionSearchFilter filter) {
        try {
            log.info("Counting questions with filters");

            Long count = questionRepository.countByFilters(filter);
            return ApiResponse.success("Question count retrieved successfully", count);

        } catch (Exception e) {
            log.error("Error counting questions with filters: {}", e.getMessage());
            return ApiResponse.internalError("Failed to count questions: " + e.getMessage());
        }
    }
}
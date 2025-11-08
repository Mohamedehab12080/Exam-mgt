package com.iti.training.exam.core.service;

import com.iti.training.api.service.IAttemptService;
import com.iti.training.exam.core.controller.config.ApiResponse;
import com.iti.training.exam.core.mapper.AttemptMapper;
import com.iti.training.exam.model.entities.Attempt;
import com.iti.training.exam.model.filter.AttemptSearchFilter;
import com.iti.training.api.repository.AttemptRepository;
import com.iti.training.exam.model.vto.AttemptView;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class AttemptServiceImpl implements IAttemptService {

    private final AttemptRepository attemptRepository;
    private final AttemptMapper attemptMapper;

    @Override
    @Transactional(readOnly = true)
    public ApiResponse<AttemptView> getAttemptById(Integer attemptId) {
        try {
            log.info("Fetching attempt by ID: {}", attemptId);

            Attempt attempt = attemptRepository.selectById(attemptId)
                    .orElseThrow(() -> new RuntimeException("Attempt not found with ID: " + attemptId));

            AttemptView response = attemptMapper.toAttemptView(attempt);
            return ApiResponse.success("Attempt retrieved successfully", response);

        } catch (Exception e) {
            log.error("Error fetching attempt by ID {}: {}", attemptId, e.getMessage());
            return ApiResponse.notFound("Failed to fetch attempt: " + e.getMessage());
        }
    }

    @Override
    @Transactional(readOnly = true)
    public ApiResponse<List<AttemptView>> getAllByFilters(AttemptSearchFilter filter) {
        try {
            log.info("Fetching attempts with filters");

            List<Attempt> attempts = attemptRepository.selectAllByFilters(filter);
            List<AttemptView> responses = attempts.stream()
                    .map(attemptMapper::toAttemptView)
                    .collect(Collectors.toList());

            return ApiResponse.success("Attempts retrieved successfully", responses);

        } catch (Exception e) {
            log.error("Error fetching attempts with filters: {}", e.getMessage());
            return ApiResponse.internalError("Failed to fetch attempts: " + e.getMessage());
        }
    }

    @Override
    @Transactional(readOnly = true)
    public ApiResponse<Long> countByFilters(AttemptSearchFilter filter) {
        try {
            log.info("Counting attempts with filters");

            Long count = attemptRepository.countByFilters(filter);
            return ApiResponse.success("Attempt count retrieved successfully", count);

        } catch (Exception e) {
            log.error("Error counting attempts with filters: {}", e.getMessage());
            return ApiResponse.internalError("Failed to count attempts: " + e.getMessage());
        }
    }
}
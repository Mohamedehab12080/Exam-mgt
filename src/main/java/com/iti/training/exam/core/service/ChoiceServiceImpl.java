package com.iti.training.exam.core.service;

import com.iti.training.api.service.IChoiceService;
import com.iti.training.exam.core.controller.config.ApiResponse;
import com.iti.training.exam.core.mapper.ChoiceMapper;
import com.iti.training.exam.model.dto.ChoiceDTO;
import com.iti.training.exam.model.dto.response.ChoiceResponse;
import com.iti.training.exam.model.entities.Choice;
import com.iti.training.exam.model.filter.ChoiceSearchFilter;
import com.iti.training.api.repository.ChoiceRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;
@Slf4j
@Service
@RequiredArgsConstructor
public class ChoiceServiceImpl implements IChoiceService {

    private final ChoiceRepository choiceRepository;
    private final ChoiceMapper choiceMapper;

    @Override
    @Transactional
    public ApiResponse<ChoiceResponse> createChoice(ChoiceDTO choiceDTO) {
        try {
            log.info("Creating choice for question ID: {}", choiceDTO.getQuestionId());

            Choice choice = choiceMapper.toChoice(choiceDTO);
            Choice savedChoice = choiceRepository.insert(choice);

            log.info("Choice created with ID: {}", savedChoice.getChoiceId());

            ChoiceResponse response = choiceMapper.toResponse(savedChoice);
            return ApiResponse.created("Choice created successfully", response);

        } catch (Exception e) {
            log.error("Error creating choice: {}", e.getMessage());
            return ApiResponse.error("Failed to create choice: " + e.getMessage());
        }
    }

    @Override
    @Transactional(readOnly = true)
    public ApiResponse<List<ChoiceResponse>> getAllByFilters(ChoiceSearchFilter filter) {
        try {
            log.info("Fetching choices with filters");

            List<Choice> choices = choiceRepository.selectAllByFilters(filter);
            List<ChoiceResponse> responses = choices.stream()
                    .map(choiceMapper::toResponse)
                    .collect(Collectors.toList());

            return ApiResponse.success("Choices retrieved successfully", responses);

        } catch (Exception e) {
            log.error("Error fetching choices with filters: {}", e.getMessage());
            return ApiResponse.internalError("Failed to fetch choices: " + e.getMessage());
        }
    }

    @Override
    @Transactional(readOnly = true)
    public ApiResponse<Long> countByFilters(ChoiceSearchFilter filter) {
        try {
            log.info("Counting choices with filters");

            long count = choiceRepository.countByFilters(filter);
            return ApiResponse.success("Choice count retrieved successfully", count);

        } catch (Exception e) {
            log.error("Error counting choices with filters: {}", e.getMessage());
            return ApiResponse.internalError("Failed to count choices: " + e.getMessage());
        }
    }

    @Override
    @Transactional
    public ApiResponse<ChoiceResponse> updateChoice(Integer choiceId, ChoiceDTO choiceDTO) {
        try {
            log.info("Updating choice with ID: {}", choiceId);

            // Check if choice exists
            if (!choiceRepository.existsById(choiceId)) {
                return ApiResponse.notFound("Choice not found with ID: " + choiceId);
            }

            Choice choice = choiceMapper.toChoice(choiceDTO);
            choice.setChoiceId(choiceId);
            Choice updatedChoice = choiceRepository.insert(choice);

            log.info("Choice updated successfully");

            ChoiceResponse response = choiceMapper.toResponse(updatedChoice);
            return ApiResponse.success("Choice updated successfully", response);

        } catch (Exception e) {
            log.error("Error updating choice with ID {}: {}", choiceId, e.getMessage());
            return ApiResponse.error("Failed to update choice: " + e.getMessage());
        }
    }

    @Override
    @Transactional
    public ApiResponse<Void> deleteChoice(Integer choiceId) {
        try {
            log.info("Deleting choice with ID: {}", choiceId);

            if (!choiceRepository.existsById(choiceId)) {
                return ApiResponse.notFound("Choice not found with ID: " + choiceId);
            }

            choiceRepository.deleteById(choiceId);
            log.info("Choice deleted successfully");

            return ApiResponse.success("Choice deleted successfully", null);

        } catch (Exception e) {
            log.error("Error deleting choice with ID {}: {}", choiceId, e.getMessage());
            return ApiResponse.error("Failed to delete choice: " + e.getMessage());
        }
    }
}
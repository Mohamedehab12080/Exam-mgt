package com.iti.training.exam.core.service;

import com.iti.training.api.repository.CourseRepository;
import com.iti.training.api.repository.StudentRepository;
import com.iti.training.api.service.IExamService;
import com.iti.training.exam.core.controller.config.ApiResponse;
import com.iti.training.exam.core.mapper.ExamMapper;
import com.iti.training.exam.model.dto.*;
import com.iti.training.api.repository.ExamRepository;
import com.iti.training.exam.model.dto.response.ExamResponse;
import com.iti.training.exam.model.dto.response.ExamResultResponse;
import com.iti.training.exam.model.entities.Course;
import com.iti.training.exam.model.entities.Exam;
import com.iti.training.exam.model.filter.ExamSearchFilter;
import com.iti.training.exam.model.vto.ExamView;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;
@Slf4j
@Service
@RequiredArgsConstructor
public class ExamServiceImpl implements IExamService {

    private final ExamRepository examRepository;
    private final CourseRepository courseRepository;
    private final StudentRepository studentRepository;
    private final ExamMapper examMapper;

    @Override
    @Transactional
    public ApiResponse<ExamResponse> createExam(ExamDTO examDTO) {
        try {
            Course course = courseRepository.selectById(examDTO.getCourseId()).orElse(null);
            if(course == null) {
                return ApiResponse.notFound("Course not found: " + examDTO.getCourseId());
            }
            log.info("Creating exam for course: {}", course.getCourseName());

            // Call stored procedure
            examRepository.createExamWithRandomQuestions(
                    course.getCourseName(),
                    examDTO.getDuration(),
                    examDTO.getTitle(),
                    examDTO.getNumMcq(),
                    examDTO.getNumTf()
            );

            log.info("Exam created successfully for course: {}", course.getCourseName());

            ExamResponse response =examMapper.toResponse(examDTO);
            response.setMessage("Exam created successfully with " +
                    examDTO.getNumMcq() + " MCQs and " +
                    examDTO.getNumTf() + " True/False questions");

            return ApiResponse.created("Exam created successfully", response);

        } catch (Exception e) {
            log.error("Error creating exam: {}", e.getMessage());
            return ApiResponse.error("Failed to create exam: " + e.getMessage());
        }
    }

    @Override
    @Transactional
    public ApiResponse<ExamResultResponse> submitExam(ExamSubmissionDTO examSubmissionDTO) {
        try {
            log.info("Submitting exam for student SSN: {}, exam ID: {}", examSubmissionDTO.getSsn(), examSubmissionDTO.getExamId());

            // Validate student exists
            if (!studentRepository.existsById(examSubmissionDTO.getSsn())) {
                return ApiResponse.notFound("Student not found with SSN: " + examSubmissionDTO.getSsn());
            }

            // Call stored procedure
            var result = examRepository.submitExam(
                    examSubmissionDTO.getSsn(),
                    examSubmissionDTO.getExamId(),
                    examSubmissionDTO.getAnswers()
            );

            log.info("Exam submitted successfully. Attempt ID: {}, Grade: {}", result.attemptId(), result.grade());

            ExamResultResponse response = examMapper.toExamResultResponse(result);

            return ApiResponse.success("Exam submitted successfully", response);

        } catch (Exception e) {
            log.error("Error submitting exam: {}", e.getMessage());
            return ApiResponse.error("Failed to submit exam: " + e.getMessage());
        }
    }

    @Override
    @Transactional(readOnly = true)
    public ApiResponse<List<ExamView>> getAllByFilters(ExamSearchFilter filter) {
        try {
            log.info("Fetching exams with filters");

            List<Exam> exams = examRepository.selectAllByFilters(filter);
            List<ExamView> responses = exams.stream()
                    .map(examMapper::toExamView)
                    .collect(Collectors.toList());

            return ApiResponse.success("Exams retrieved successfully", responses);

        } catch (Exception e) {
            log.error("Error fetching exams with filters: {}", e.getMessage());
            return ApiResponse.internalError("Failed to fetch exams: " + e.getMessage());
        }
    }

    @Override
    @Transactional(readOnly = true)
    public ApiResponse<Long> countByFilters(ExamSearchFilter filter) {
        try {
            log.info("Counting exams with filters");

            Long count = examRepository.countByFilters(filter);
            return ApiResponse.success("Exam count retrieved successfully", count);

        } catch (Exception e) {
            log.error("Error counting exams with filters: {}", e.getMessage());
            return ApiResponse.internalError("Failed to count exams: " + e.getMessage());
        }
    }
}
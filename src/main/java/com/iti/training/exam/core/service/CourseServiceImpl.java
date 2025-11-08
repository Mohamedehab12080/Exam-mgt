package com.iti.training.exam.core.service;


import com.iti.training.api.service.ICourseService;
import com.iti.training.exam.core.controller.config.ApiResponse;
import com.iti.training.exam.core.mapper.CourseMapper;
import com.iti.training.exam.model.dto.CourseDTO;
import com.iti.training.exam.model.dto.response.CourseResponse;
import com.iti.training.exam.model.entities.Course;
import com.iti.training.exam.model.filter.CourseSearchFilter;
import com.iti.training.api.repository.CourseRepository;
import com.iti.training.exam.model.vto.CourseView;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
@Slf4j
@Service
@RequiredArgsConstructor
public class CourseServiceImpl implements ICourseService {

    private final CourseRepository courseRepository;
    private final CourseMapper courseMapper;

    @Override
    @Transactional
    public ApiResponse<CourseResponse> createCourse(CourseDTO courseDTO) {
        try {
            log.info("Creating course: {}", courseDTO.getCourseName());

            Course course = courseMapper.toCourse(courseDTO);
            Course savedCourse = courseRepository.insert(course);

            log.info("Course created with ID: {}", savedCourse.getCourseId());

            CourseResponse response = courseMapper.toResponse(savedCourse);
            return ApiResponse.created("Course created successfully", response);

        } catch (Exception e) {
            log.error("Error creating course: {}", e.getMessage());
            return ApiResponse.error("Failed to create course: " + e.getMessage());
        }
    }

    @Override
    @Transactional(readOnly = true)
    public ApiResponse<CourseResponse> getCourseById(Integer courseId) {
        try {
            log.info("Fetching course by ID: {}", courseId);

            Course course = courseRepository.selectById(courseId)
                    .orElseThrow(() -> new RuntimeException("Course not found with ID: " + courseId));

            CourseResponse response = courseMapper.toResponse(course);
            return ApiResponse.success("Course retrieved successfully", response);

        } catch (Exception e) {
            log.error("Error fetching course by ID {}: {}", courseId, e.getMessage());
            return ApiResponse.notFound("Failed to fetch course: " + e.getMessage());
        }
    }

    @Override
    @Transactional
    public ApiResponse<CourseResponse> updateCourse(Integer courseId, CourseDTO courseDTO) {
        try {
            log.info("Updating course with ID: {}", courseId);

            // Check if course exists
            if (!courseRepository.existsById(courseId)) {
                return ApiResponse.notFound("Course not found with ID: " + courseId);
            }

            Course course = courseMapper.toCourse(courseDTO);
            course.setCourseId(courseId);
            Course updatedCourse = courseRepository.insert(course);

            log.info("Course updated successfully");

            CourseResponse response = courseMapper.toResponse(updatedCourse);
            return ApiResponse.success("Course updated successfully", response);

        } catch (Exception e) {
            log.error("Error updating course with ID {}: {}", courseId, e.getMessage());
            return ApiResponse.error("Failed to update course: " + e.getMessage());
        }
    }

    @Override
    @Transactional
    public ApiResponse<Void> deleteCourse(Integer courseId) {
        try {
            log.info("Deleting course with ID: {}", courseId);

            if (!courseRepository.existsById(courseId)) {
                return ApiResponse.notFound("Course not found with ID: " + courseId);
            }

            courseRepository.deleteById(courseId);
            log.info("Course deleted successfully");

            return ApiResponse.success("Course deleted successfully", null);

        } catch (Exception e) {
            log.error("Error deleting course with ID {}: {}", courseId, e.getMessage());
            return ApiResponse.error("Failed to delete course: " + e.getMessage());
        }
    }

    @Override
    @Transactional(readOnly = true)
    public ApiResponse<List<CourseView>> getAllByFilters(CourseSearchFilter filter) {
        try {
            log.info("Fetching courses with filters");

            List<Course> courses = courseRepository.selectAllByFilters(filter);
            List<CourseView> courseViews = courses.stream()
                    .map(courseMapper::toCourseView)
                    .toList();

            return ApiResponse.success("Courses retrieved successfully", courseViews);

        } catch (Exception e) {
            log.error("Error fetching courses with filters: {}", e.getMessage());
            return ApiResponse.internalError("Failed to fetch courses: " + e.getMessage());
        }
    }

    @Override
    @Transactional(readOnly = true)
    public ApiResponse<Long> countByFilters(CourseSearchFilter filter) {
        try {
            log.info("Counting courses with filters");

            Long count = courseRepository.countByFilters(filter);
            return ApiResponse.success("Course count retrieved successfully", count);

        } catch (Exception e) {
            log.error("Error counting courses with filters: {}", e.getMessage());
            return ApiResponse.internalError("Failed to count courses: " + e.getMessage());
        }
    }
}
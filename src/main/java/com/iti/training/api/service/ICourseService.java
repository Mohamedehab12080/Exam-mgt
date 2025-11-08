package com.iti.training.api.service;

import com.iti.training.exam.core.controller.config.ApiResponse;
import com.iti.training.exam.model.dto.CourseDTO;
import com.iti.training.exam.model.dto.response.CourseResponse;
import com.iti.training.exam.model.filter.CourseSearchFilter;
import com.iti.training.exam.model.vto.CourseView;

import java.util.List;

public interface ICourseService {
    ApiResponse<CourseResponse> createCourse(CourseDTO courseDTO);
    ApiResponse<CourseResponse> getCourseById(Integer courseId);
    ApiResponse<CourseResponse> updateCourse(Integer courseId, CourseDTO courseDTO);
    ApiResponse<Void> deleteCourse(Integer courseId);
    ApiResponse<List<CourseView>> getAllByFilters(CourseSearchFilter filter);
    ApiResponse<Long> countByFilters(CourseSearchFilter filter);
}
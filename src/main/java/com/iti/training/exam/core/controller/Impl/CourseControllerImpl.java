package com.iti.training.exam.core.controller.Impl;

import com.iti.training.api.repository.model.PaginationInfo;
import com.iti.training.api.repository.model.SortingInfo;
import com.iti.training.api.service.ICourseService;
import com.iti.training.exam.core.controller.config.ApiResponse;
import com.iti.training.exam.core.controller.generated.course.CoursesController;
import com.iti.training.exam.model.dto.CourseDTO;
import com.iti.training.exam.model.filter.CourseSearchFilter;
import lombok.AllArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.RestController;

@RestController
@AllArgsConstructor
public class CourseControllerImpl implements CoursesController {

    private final ICourseService courseService;

    @Override
    public ResponseEntity<ApiResponse> _countCourses(String courseName, Boolean hasExams) {
        CourseSearchFilter filter = CourseSearchFilter.builder()
                .courseName(courseName)
                .hasExams(hasExams)
                .build();

        ApiResponse response = courseService.countByFilters(filter);
        return ResponseEntity.status(response.getStatus()).body(response);
    }

    @Override
    public ResponseEntity<ApiResponse> _createCourse(CourseDTO courseDTO) {
        ApiResponse response = courseService.createCourse(courseDTO);
        return ResponseEntity.status(response.getStatus()).body(response);
    }

    @Override
    public ResponseEntity<ApiResponse> _deleteCourse(Integer courseId) {
        ApiResponse response = courseService.deleteCourse(courseId);
        return ResponseEntity.status(response.getStatus()).body(response);
    }

    @Override
    public ResponseEntity<ApiResponse> _getCourseById(Integer courseId) {
        ApiResponse response = courseService.getCourseById(courseId);
        return ResponseEntity.status(response.getStatus()).body(response);
    }

    @Override
    public ResponseEntity<ApiResponse> _getCourses(String courseName, Integer duration, Integer minDuration, Integer maxDuration, Boolean hasExams, Boolean hasQuestions, Integer page, Integer size, String sort) {

        SortingInfo sorting = null;
        if (sort != null) {
            String[] sortParts = sort.split(",");
            sorting = SortingInfo.builder()
                    .by(sortParts[0])
                    .dir(sortParts.length > 1 ? sortParts[1] : "ASC")
                    .build();
        }
        CourseSearchFilter filter = CourseSearchFilter.builder()
                .courseName(courseName)
                .duration(duration)
                .minDuration(minDuration)
                .maxDuration(maxDuration)
                .hasExams(hasExams)
                .hasQuestions(hasQuestions)
                .sorting(sorting)
                .pagination(PaginationInfo.builder().pageSize(size).pageNum(page).build())
                .build();

        ApiResponse response = courseService.getAllByFilters(filter);
        return ResponseEntity.status(response.getStatus()).body(response);
    }

    @Override
    public ResponseEntity<ApiResponse> _updateCourse(Integer courseId, CourseDTO courseDTO) {
        ApiResponse response = courseService.updateCourse(courseId, courseDTO);
        return ResponseEntity.status(response.getStatus()).body(response);
    }
}
package com.iti.training.api.repository;

import com.iti.training.exam.model.entities.Course;
import com.iti.training.exam.model.filter.CourseSearchFilter;

import java.util.List;
import java.util.Optional;

public interface CourseRepository {

    // Basic CRUD operations
    Course insert(Course course);
    Optional<Course> selectById(Integer courseId);
    void deleteById(Integer courseId);
    boolean existsById(Integer courseId);

    // Search operations with filters
    List<Course> selectAllByFilters(CourseSearchFilter filter);
    long countByFilters(CourseSearchFilter filter);

}
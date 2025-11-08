package com.iti.training.exam.repository;

import com.iti.training.api.repository.CourseRepository;
import com.iti.training.exam.model.entities.Course;
import com.iti.training.exam.model.filter.CourseSearchFilter;
import com.iti.training.exam.repository.jpa.CourseJPARepository;
import com.iti.training.exam.repository.query.CourseQueryBuilder;
import lombok.AllArgsConstructor;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
@AllArgsConstructor
public class CourseRepositoryImpl implements CourseRepository {

    private final CourseJPARepository courseJPARepository;
    private final CourseQueryBuilder queryBuilder;

    @Override
    public Course insert(Course course) {
        return courseJPARepository.save(course);
    }

    @Override
    public Optional<Course> selectById(Integer courseId) {
        return courseJPARepository.findById(courseId);
    }

    @Override
    public void deleteById(Integer courseId) {
        courseJPARepository.deleteById(courseId);
    }

    @Override
    public boolean existsById(Integer courseId) {
        return courseJPARepository.existsById(courseId);
    }

    @Override
    public List<Course> selectAllByFilters(CourseSearchFilter filter) {
        return queryBuilder.selectAllByFilters(filter);
    }

    @Override
    public long countByFilters(CourseSearchFilter filter) {
        return queryBuilder.countAllByFilters(filter);
    }
}

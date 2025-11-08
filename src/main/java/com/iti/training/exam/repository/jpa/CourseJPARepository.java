package com.iti.training.exam.repository.jpa;

import com.iti.training.exam.model.entities.Course;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.Optional;

@Repository
public interface CourseJPARepository extends JpaRepository<Course, Integer> {
    Optional<Course> findByCourseName(String courseName);
    boolean existsByCourseName(String courseName);
}
package com.iti.training.api.repository;

import com.iti.training.exam.model.entities.Student;
import com.iti.training.exam.model.filter.StudentSearchFilter;

import java.util.List;
import java.util.Optional;

public interface StudentRepository {

    // Basic CRUD operations
    Student insert(Student student);
    Optional<Student> selectById(String ssn);
    void deleteById(String ssn);
    boolean existsById(String ssn);

    // Search operations with filters
    List<Student> selectAllByFilters(StudentSearchFilter filter);
    long countByFilters(StudentSearchFilter filter);
}
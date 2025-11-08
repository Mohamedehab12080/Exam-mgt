package com.iti.training.api.repository;

import com.iti.training.exam.model.entities.Attempt;
import com.iti.training.exam.model.filter.AttemptSearchFilter;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

public interface AttemptRepository {

    // Basic CRUD operations
    Attempt insert(Attempt attempt);
    Optional<Attempt> selectById(Integer attemptId);
    void deleteById(Integer attemptId);
    boolean existsById(Integer attemptId);

    // Search operations with filters
    List<Attempt> selectAllByFilters(AttemptSearchFilter filter);
    long countByFilters(AttemptSearchFilter filter);
}
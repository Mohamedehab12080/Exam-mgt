package com.iti.training.api.repository;


import com.iti.training.exam.model.entities.Question;
import com.iti.training.exam.model.filter.QuestionSearchFilter;

import java.util.List;
import java.util.Optional;

public interface QuestionRepository {

    // Basic CRUD operations
    Question insert(Question question);
    Optional<Question> selectById(Integer questionId);
    void deleteById(Integer questionId);
    boolean existsById(Integer questionId);

    List<Question> selectAllByFilters(QuestionSearchFilter filter);
    long countByFilters(QuestionSearchFilter filter);
}

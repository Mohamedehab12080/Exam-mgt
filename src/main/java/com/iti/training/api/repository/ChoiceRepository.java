package com.iti.training.api.repository;


import com.iti.training.exam.model.entities.Choice;
import com.iti.training.exam.model.filter.ChoiceSearchFilter;

import java.util.List;
import java.util.Optional;

public interface ChoiceRepository {

    // Basic CRUD operations
    Choice insert(Choice choice);
    Optional<Choice> selectById(Integer choiceId);
    void deleteById(Integer choiceId);
    boolean existsById(Integer choiceId);

    // Search operations with filters
    List<Choice> selectAllByFilters(ChoiceSearchFilter filter);
    long countByFilters(ChoiceSearchFilter filter);

}
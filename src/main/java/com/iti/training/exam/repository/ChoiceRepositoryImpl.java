package com.iti.training.exam.repository;

import com.iti.training.api.repository.ChoiceRepository;
import com.iti.training.exam.model.entities.Choice;
import com.iti.training.exam.model.filter.ChoiceSearchFilter;
import com.iti.training.exam.repository.jpa.ChoiceJPARepository;
import com.iti.training.exam.repository.query.ChoiceQueryBuilder;
import lombok.AllArgsConstructor;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
@AllArgsConstructor
public class ChoiceRepositoryImpl implements ChoiceRepository {

    private final ChoiceJPARepository choiceJPARepository;
    private final ChoiceQueryBuilder queryBuilder;


    @Override
    public Choice insert(Choice choice) {
        return choiceJPARepository.save(choice);
    }

    @Override
    public Optional<Choice> selectById(Integer choiceId) {
        return choiceJPARepository.findById(choiceId);
    }

    @Override
    public void deleteById(Integer choiceId) {
        choiceJPARepository.deleteById(choiceId);
    }

    @Override
    public boolean existsById(Integer choiceId) {
        return choiceJPARepository.existsById(choiceId);
    }

    @Override
    public List<Choice> selectAllByFilters(ChoiceSearchFilter filter) {
        return queryBuilder.selectAllByFilters(filter);
    }

    @Override
    public long countByFilters(ChoiceSearchFilter filter) {
        return queryBuilder.countAllByFilters(filter);
    }
}

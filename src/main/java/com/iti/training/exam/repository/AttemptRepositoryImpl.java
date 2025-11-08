package com.iti.training.exam.repository;

import com.iti.training.api.repository.AttemptRepository;
import com.iti.training.exam.model.entities.Attempt;
import com.iti.training.exam.model.filter.AttemptSearchFilter;
import com.iti.training.exam.repository.jpa.AttemptJPARepository;
import com.iti.training.exam.repository.query.AttemptQueryBuilder;
import lombok.AllArgsConstructor;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
@AllArgsConstructor
public class AttemptRepositoryImpl implements AttemptRepository {

    private final AttemptJPARepository  attemptJPARepository;
    private final AttemptQueryBuilder queryBuilder;

    @Override
    public Attempt insert(Attempt attempt) {
        return attemptJPARepository.save(attempt);
    }

    @Override
    public Optional<Attempt> selectById(Integer attemptId) {
        return attemptJPARepository.findById(attemptId);
    }

    @Override
    public void deleteById(Integer attemptId) {
        attemptJPARepository.deleteById(attemptId);
    }

    @Override
    public boolean existsById(Integer attemptId) {
        return attemptJPARepository.existsById(attemptId);
    }

    @Override
    public List<Attempt> selectAllByFilters(AttemptSearchFilter filter) {
        return queryBuilder.selectAllByFilters(filter);
    }

    @Override
    public long countByFilters(AttemptSearchFilter filter) {
        return queryBuilder.countAllByFilters(filter);
    }
}

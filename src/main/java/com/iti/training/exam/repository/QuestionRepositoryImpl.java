package com.iti.training.exam.repository;

import com.iti.training.api.repository.QuestionRepository;
import com.iti.training.exam.model.entities.Question;
import com.iti.training.exam.model.filter.QuestionSearchFilter;
import com.iti.training.exam.repository.jpa.QuestionJPARepository;
import com.iti.training.exam.repository.query.QuestionQueryBuilder;
import lombok.AllArgsConstructor;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
@AllArgsConstructor
public class QuestionRepositoryImpl implements QuestionRepository {

    private final QuestionJPARepository questionJPARepository;
    private final QuestionQueryBuilder queryBuilder;

    @Override
    public Question insert(Question question) {
        return questionJPARepository.save(question);
    }

    @Override
    public Optional<Question> selectById(Integer questionId) {
        return questionJPARepository.findById(questionId);
    }

    @Override
    public void deleteById(Integer questionId) {
        questionJPARepository.deleteById(questionId);
    }

    @Override
    public boolean existsById(Integer questionId) {
        return questionJPARepository.existsById(questionId);
    }

    @Override
    public List<Question> selectAllByFilters(QuestionSearchFilter filter) {
        return queryBuilder.selectAllByFilters(filter);
    }

    @Override
    public long countByFilters(QuestionSearchFilter filter) {
        return queryBuilder.countAllByFilters(filter);
    }
}

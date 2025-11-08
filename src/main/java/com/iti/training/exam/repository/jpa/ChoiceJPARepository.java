package com.iti.training.exam.repository.jpa;

import com.iti.training.exam.model.entities.Choice;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface ChoiceJPARepository extends JpaRepository<Choice, Integer> {
    List<Choice> findByQuestion_QuestionId(Integer questionId);
    List<Choice> findByQuestion_QuestionIdAndIsCorrect(Integer questionId, Boolean isCorrect);
}
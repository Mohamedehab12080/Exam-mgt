package com.iti.training.exam.repository.query;

import com.iti.training.api.repository.AbstractQueryBuilder;
import com.iti.training.exam.model.entities.Choice;
import com.iti.training.exam.model.filter.ChoiceSearchFilter;
import jakarta.persistence.EntityManager;
import jakarta.persistence.TypedQuery;
import org.springframework.stereotype.Repository;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;

@Repository
public class ChoiceQueryBuilder extends AbstractQueryBuilder<Choice, ChoiceSearchFilter> {

    private final EntityManager em;

    public ChoiceQueryBuilder(EntityManager em) {
        super(em);
        this.em = em;
    }

    @Override
    public Class<Choice> getEntityNameClass() {
        return Choice.class;
    }

    @Override
    public String joinQuery() {
        return "LEFT JOIN item.question question ";
    }

    @Override
    public List<String> evaluateWhereConditions(ChoiceSearchFilter filters) {
        List<String> conditions = new ArrayList<>();

        if (filters.getQuestionId() != null) {
            conditions.add("question.questionId = :questionId");
        }
        if (filters.getChoiceText() != null && !filters.getChoiceText().isBlank()) {
            conditions.add("item.choiceText LIKE :choiceText");
        }
        if (filters.getIsCorrect() != null) {
            conditions.add("item.isCorrect = :isCorrect");
        }

        return conditions;
    }

    @Override
    public void setParameters(TypedQuery<?> query, ChoiceSearchFilter filters) {
        if (filters.getQuestionId() != null) {
            query.setParameter("questionId", filters.getQuestionId());
        }
        if (filters.getChoiceText() != null && !filters.getChoiceText().isBlank()) {
            query.setParameter("choiceText", "%" + filters.getChoiceText() + "%");
        }
        if (filters.getIsCorrect() != null) {
            query.setParameter("isCorrect", filters.getIsCorrect());
        }
    }

    @Override
    protected Map<String, String> getSortingMap() {
        return Map.of(
                "isCorrect", "item.isCorrect",
                "questionId", "question.questionId"
        );
    }

}
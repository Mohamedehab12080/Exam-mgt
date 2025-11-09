package com.iti.training.exam.repository.query;


import com.iti.training.api.repository.AbstractQueryBuilder;
import com.iti.training.exam.model.entities.Question;
import com.iti.training.exam.model.filter.QuestionSearchFilter;
import jakarta.persistence.EntityManager;
import jakarta.persistence.TypedQuery;
import org.springframework.stereotype.Repository;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;

@Repository
public class QuestionQueryBuilder extends AbstractQueryBuilder<Question, QuestionSearchFilter> {

    private final EntityManager em;

    public QuestionQueryBuilder(EntityManager em) {
        super(em);
        this.em = em;
    }

    @Override
    public Class<Question> getEntityNameClass() {
        return Question.class;
    }

    @Override
    public String joinQuery() {
        return "LEFT JOIN item.course course ";
    }

    @Override
    public List<String> evaluateWhereConditions(QuestionSearchFilter filters) {
        List<String> conditions = new ArrayList<>();

        if (filters.getCourseId() != null) {
            conditions.add("course.courseId = :courseId");
        }
        if (filters.getType() != null && !filters.getType().isBlank()) {
            conditions.add("item.type = :type");
        }
        if (filters.getQuestionText() != null && !filters.getQuestionText().isBlank()) {
            conditions.add("item.question LIKE :questionText");
        }
        if (filters.getHasChoices() != null) {
            if (filters.getHasChoices()) {
                conditions.add("SIZE(item.choices) > 0");
            } else {
                conditions.add("SIZE(item.choices) = 0");
            }
        }
        if (filters.getMinChoiceCount() != null) {
            conditions.add("SIZE(item.choices) >= :minChoiceCount");
        }

        return conditions;
    }

    @Override
    public void setParameters(TypedQuery<?> query, QuestionSearchFilter filters) {
        if (filters.getCourseId() != null) {
            query.setParameter("courseId", filters.getCourseId());
        }
        if (filters.getType() != null && !filters.getType().isBlank()) {
            query.setParameter("type", filters.getType());
        }
        if (filters.getQuestionText() != null && !filters.getQuestionText().isBlank()) {
            query.setParameter("questionText", "%" + filters.getQuestionText() + "%");
        }
        if (filters.getMinChoiceCount() != null) {
            query.setParameter("minChoiceCount", filters.getMinChoiceCount());
        }
    }

    @Override
    protected Map<String, String> getSortingMap() {
        return Map.of(
                "type", "item.type",
                "question", "item.question",
                "courseName", "item.course.courseName",
                "choiceCount", "SIZE(item.choices)"
        );
    }

}
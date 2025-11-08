package com.iti.training.exam.repository.query;


import com.iti.training.api.repository.AbstractQueryBuilder;
import com.iti.training.exam.model.entities.Course;
import com.iti.training.exam.model.filter.CourseSearchFilter;
import jakarta.persistence.EntityManager;
import jakarta.persistence.TypedQuery;
import org.springframework.stereotype.Repository;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;

@Repository
public class CourseQueryBuilder extends AbstractQueryBuilder<Course, CourseSearchFilter> {

    private final EntityManager em;

    public CourseQueryBuilder(EntityManager em) {
        super(em);
        this.em = em;
    }

    @Override
    public Class<Course> getEntityNameClass() {
        return Course.class;
    }

    @Override
    public List<String> evaluateWhereConditions(CourseSearchFilter filters) {
        List<String> conditions = new ArrayList<>();

        if (filters.getCourseName() != null && !filters.getCourseName().isBlank()) {
            conditions.add("item.courseName LIKE :courseName");
        }
        if (filters.getDuration() != null) {
            conditions.add("item.duration = :duration");
        }
        if (filters.getMinDuration() != null) {
            conditions.add("item.duration >= :minDuration");
        }
        if (filters.getMaxDuration() != null) {
            conditions.add("item.duration <= :maxDuration");
        }
        if (filters.getHasExams() != null) {
            if (filters.getHasExams()) {
                conditions.add("SIZE(item.exams) > 0");
            } else {
                conditions.add("SIZE(item.exams) = 0");
            }
        }
        if (filters.getHasQuestions() != null) {
            if (filters.getHasQuestions()) {
                conditions.add("SIZE(item.questions) > 0");
            } else {
                conditions.add("SIZE(item.questions) = 0");
            }
        }

        return conditions;
    }

    @Override
    public void setParameters(TypedQuery<?> query, CourseSearchFilter filters) {
        if (filters.getCourseName() != null && !filters.getCourseName().isBlank()) {
            query.setParameter("courseName", "%" + filters.getCourseName() + "%");
        }
        if (filters.getDuration() != null) {
            query.setParameter("duration", filters.getDuration());
        }
        if (filters.getMinDuration() != null) {
            query.setParameter("minDuration", filters.getMinDuration());
        }
        if (filters.getMaxDuration() != null) {
            query.setParameter("maxDuration", filters.getMaxDuration());
        }
    }

    @Override
    protected Map<String, String> getSortingMap() {
        return Map.of(
                "courseName", "item.courseName",
                "duration", "item.duration",
                "examCount", "SIZE(item.exams)",
                "questionCount", "SIZE(item.questions)"
        );
    }

}
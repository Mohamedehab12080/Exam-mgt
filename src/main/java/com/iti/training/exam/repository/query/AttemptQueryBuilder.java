package com.iti.training.exam.repository.query;

import com.iti.training.api.repository.AbstractQueryBuilder;
import com.iti.training.exam.model.entities.Attempt;
import com.iti.training.exam.model.filter.AttemptSearchFilter;
import jakarta.persistence.EntityManager;
import jakarta.persistence.TypedQuery;
import org.springframework.stereotype.Repository;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;

@Repository
public class AttemptQueryBuilder extends AbstractQueryBuilder<Attempt, AttemptSearchFilter> {

    private final EntityManager em;

    public AttemptQueryBuilder(EntityManager em) {
        super(em);
        this.em = em;
    }

    @Override
    public Class<Attempt> getEntityNameClass() {
        return Attempt.class;
    }

    @Override
    public String joinQuery() {
        return "LEFT JOIN item.student student LEFT JOIN item.exam exam ";
    }

    @Override
    public List<String> evaluateWhereConditions(AttemptSearchFilter filters) {
        List<String> conditions = new ArrayList<>();

        if (filters.getStudentSsn() != null && !filters.getStudentSsn().isBlank()) {
            conditions.add("student.ssn = :studentSsn");
        }
        if (filters.getExamId() != null) {
            conditions.add("exam.examId = :examId");
        }
        if (filters.getAttemptDate() != null) {
            conditions.add("item.attemptDate = :attemptDate");
        }
        if (filters.getStartDate() != null) {
            conditions.add("item.attemptDate >= :startDate");
        }
        if (filters.getEndDate() != null) {
            conditions.add("item.attemptDate <= :endDate");
        }
        if (filters.getMinGrade() != null) {
            conditions.add("item.grade >= :minGrade");
        }
        if (filters.getMaxGrade() != null) {
            conditions.add("item.grade <= :maxGrade");
        }

        return conditions;
    }

    @Override
    public void setParameters(TypedQuery<?> query, AttemptSearchFilter filters) {
        if (filters.getStudentSsn() != null && !filters.getStudentSsn().isBlank()) {
            query.setParameter("studentSsn", filters.getStudentSsn());
        }
        if (filters.getExamId() != null) {
            query.setParameter("examId", filters.getExamId());
        }
        if (filters.getAttemptDate() != null) {
            query.setParameter("attemptDate", filters.getAttemptDate());
        }
        if (filters.getStartDate() != null) {
            query.setParameter("startDate", filters.getStartDate());
        }
        if (filters.getEndDate() != null) {
            query.setParameter("endDate", filters.getEndDate());
        }
        if (filters.getMinGrade() != null) {
            query.setParameter("minGrade", filters.getMinGrade());
        }
        if (filters.getMaxGrade() != null) {
            query.setParameter("maxGrade", filters.getMaxGrade());
        }
    }

    @Override
    protected Map<String, String> getSortingMap() {
        return Map.of(
                "attemptDate", "item.attemptDate",
                "grade", "item.grade",
                "studentName", "CONCAT(student.firstName, ' ', student.lastName)",
                "examTitle", "exam.title"
        );
    }

}
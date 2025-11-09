package com.iti.training.exam.repository.query;


import com.iti.training.api.repository.AbstractQueryBuilder;
import com.iti.training.exam.model.entities.Exam;
import com.iti.training.exam.model.filter.ExamSearchFilter;
import jakarta.persistence.EntityManager;
import jakarta.persistence.TypedQuery;
import org.springframework.stereotype.Repository;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;

@Repository
public class ExamQueryBuilder extends AbstractQueryBuilder<Exam, ExamSearchFilter> {

    private final EntityManager em;

    public ExamQueryBuilder(EntityManager em) {
        super(em);
        this.em = em;
    }

    @Override
    public Class<Exam> getEntityNameClass() {
        return Exam.class;
    }

    @Override
    public String joinQuery() {
        return "LEFT JOIN item.course course ";
    }

    @Override
    public List<String> evaluateWhereConditions(ExamSearchFilter filters) {
        List<String> conditions = new ArrayList<>();

        if (filters.getTitle() != null && !filters.getTitle().isBlank()) {
            conditions.add("item.title LIKE :title");
        }
        if (filters.getCourseId() != null) {
            conditions.add("course.courseId = :courseId");
        }
        if (filters.getExamDate() != null) {
            conditions.add("item.examDate = :examDate");
        }
        if (filters.getStartDate() != null) {
            conditions.add("item.examDate >= :startDate");
        }
        if (filters.getEndDate() != null) {
            conditions.add("item.examDate <= :endDate");
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

        return conditions;
    }

    @Override
    public void setParameters(TypedQuery<?> query, ExamSearchFilter filters) {
        if (filters.getTitle() != null && !filters.getTitle().isBlank()) {
            query.setParameter("title", "%" + filters.getTitle() + "%");
        }
        if (filters.getCourseId() != null) {
            query.setParameter("courseId", filters.getCourseId());
        }
        if (filters.getExamDate() != null) {
            query.setParameter("examDate", filters.getExamDate());
        }
        if (filters.getStartDate() != null) {
            query.setParameter("startDate", filters.getStartDate());
        }
        if (filters.getEndDate() != null) {
            query.setParameter("endDate", filters.getEndDate());
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
                "title", "item.title",
                "examDate", "item.examDate",
                "duration", "item.duration",
                "courseName", "course.courseName"
        );
    }
    
}
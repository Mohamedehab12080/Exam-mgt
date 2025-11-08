package com.iti.training.exam.repository.query;

import com.iti.training.api.repository.AbstractQueryBuilder;
import com.iti.training.exam.model.entities.Student;
import com.iti.training.exam.model.filter.StudentSearchFilter;
import jakarta.persistence.EntityManager;
import jakarta.persistence.TypedQuery;
import org.springframework.stereotype.Repository;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;

@Repository
public class StudentQueryBuilder extends AbstractQueryBuilder<Student, StudentSearchFilter> {

    private final EntityManager em;

    public StudentQueryBuilder(EntityManager em) {
        super(em);
        this.em = em;
    }

    @Override
    public Class<Student> getEntityNameClass() {
        return Student.class;
    }

    @Override
    public List<String> evaluateWhereConditions(StudentSearchFilter filters) {
        List<String> conditions = new ArrayList<>();

        if (filters.getFirstName() != null && !filters.getFirstName().isBlank()) {
            conditions.add("item.firstName LIKE :firstName");
        }
        if (filters.getLastName() != null && !filters.getLastName().isBlank()) {
            conditions.add("item.lastName LIKE :lastName");
        }
        if (filters.getEmail() != null && !filters.getEmail().isBlank()) {
            conditions.add("item.email LIKE :email");
        }
        if (filters.getCity() != null && !filters.getCity().isBlank()) {
            conditions.add("item.city = :city");
        }
        if (filters.getGraduationYear() != null) {
            conditions.add("item.graduationYear = :graduationYear");
        }
        if (filters.getGender() != null && !filters.getGender().isBlank()) {
            conditions.add("item.gender = :gender");
        }
        if (filters.getMinAge() != null) {
            conditions.add("item.age >= :minAge");
        }
        if (filters.getMaxAge() != null) {
            conditions.add("item.age <= :maxAge");
        }

        return conditions;
    }

    @Override
    public void setParameters(TypedQuery<?> query, StudentSearchFilter filters) {
        if (filters.getFirstName() != null && !filters.getFirstName().isBlank()) {
            query.setParameter("firstName", "%" + filters.getFirstName() + "%");
        }
        if (filters.getLastName() != null && !filters.getLastName().isBlank()) {
            query.setParameter("lastName", "%" + filters.getLastName() + "%");
        }
        if (filters.getEmail() != null && !filters.getEmail().isBlank()) {
            query.setParameter("email", "%" + filters.getEmail() + "%");
        }
        if (filters.getCity() != null && !filters.getCity().isBlank()) {
            query.setParameter("city", filters.getCity());
        }
        if (filters.getGraduationYear() != null) {
            query.setParameter("graduationYear", filters.getGraduationYear());
        }
        if (filters.getGender() != null && !filters.getGender().isBlank()) {
            query.setParameter("gender", filters.getGender());
        }
        if (filters.getMinAge() != null) {
            query.setParameter("minAge", filters.getMinAge());
        }
        if (filters.getMaxAge() != null) {
            query.setParameter("maxAge", filters.getMaxAge());
        }
    }

    @Override
    protected Map<String, String> getSortingMap() {
        return Map.of(
                "ssn", "item.ssn",
                "graduationYear", "item.graduationYear",
                "age", "item.age"
        );
    }

//    @Override
//    protected SortingInfo
//    getDefaultSorting() {
//        return new SortingInfo("firstName", "ASC");
//    }
}
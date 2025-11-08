package com.iti.training.exam.repository.jpa;

import com.iti.training.exam.model.entities.Student;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface StudentJPARepository extends JpaRepository<Student, String> {
    boolean existsBySsn(String ssn);
}
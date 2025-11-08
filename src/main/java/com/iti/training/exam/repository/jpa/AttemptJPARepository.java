package com.iti.training.exam.repository.jpa;

import com.iti.training.exam.model.entities.Attempt;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface AttemptJPARepository extends JpaRepository<Attempt, Integer> {
    List<Attempt> findByStudent_Ssn(String ssn);
    List<Attempt> findByExam_ExamId(Long examId);
    List<Attempt> findByStudent_SsnAndExam_ExamId(String ssn, Long examId);
}
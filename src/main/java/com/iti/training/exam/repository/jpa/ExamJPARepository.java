package com.iti.training.exam.repository.jpa;

import com.iti.training.exam.model.entities.Exam;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface ExamJPARepository extends JpaRepository<Exam, Long> {
    List<Exam> findByCourse_CourseId(Long courseId);
    List<Exam> findByTitleContainingIgnoreCase(String title);
}
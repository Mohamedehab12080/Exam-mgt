package com.iti.training.exam.repository.jpa;

import com.iti.training.exam.model.entities.Question;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface QuestionJPARepository extends JpaRepository<Question, Integer> {

    List<Question> findByCourse_CourseId(Long courseId);

    List<Question> findByCourse_CourseIdAndType(Long courseId, String type);

    @Query("SELECT q FROM Question q WHERE q.course.courseId = :courseId AND q.type = :type ORDER BY RAND() LIMIT :limit")
    List<Question> findRandomQuestionsByCourseIdAndType(@Param("courseId") Long courseId,
                                                      @Param("type") String type,
                                                      @Param("limit") int limit);
}
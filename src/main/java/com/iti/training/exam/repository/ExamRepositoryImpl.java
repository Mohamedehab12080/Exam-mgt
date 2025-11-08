package com.iti.training.exam.repository;

import com.iti.training.api.repository.ExamRepository;
import com.iti.training.exam.model.entities.Exam;
import com.iti.training.exam.model.filter.ExamSearchFilter;
import com.iti.training.exam.repository.query.ExamQueryBuilder;
import jakarta.persistence.EntityManager;
import jakarta.persistence.ParameterMode;
import jakarta.persistence.PersistenceContext;
import jakarta.persistence.StoredProcedureQuery;
import lombok.AllArgsConstructor;
import org.springframework.stereotype.Repository;
import com.fasterxml.jackson.databind.ObjectMapper;
import java.util.List;

@Repository
@AllArgsConstructor
public class ExamRepositoryImpl implements ExamRepository {

    @PersistenceContext
    private EntityManager entityManager;
    private ExamQueryBuilder queryBuilder;

    private final ObjectMapper objectMapper = new ObjectMapper();

    @Override
    public void createExamWithRandomQuestions(String courseName, Integer duration,
                                              String title, Integer numMcq, Integer numTf) {
        try {
            StoredProcedureQuery query = entityManager
                    .createStoredProcedureQuery("Create_Exam_With_Random_Questions")
                    .registerStoredProcedureParameter("p_Course_Name", String.class, jakarta.persistence.ParameterMode.IN)
                    .registerStoredProcedureParameter("p_Duration", Integer.class, jakarta.persistence.ParameterMode.IN)
                    .registerStoredProcedureParameter("p_Title", String.class, jakarta.persistence.ParameterMode.IN)
                    .registerStoredProcedureParameter("p_Num_MCQ", Integer.class, jakarta.persistence.ParameterMode.IN)
                    .registerStoredProcedureParameter("p_Num_TF", Integer.class, jakarta.persistence.ParameterMode.IN)
                    .setParameter("p_Course_Name", courseName)
                    .setParameter("p_Duration", duration)
                    .setParameter("p_Title", title)
                    .setParameter("p_Num_MCQ", numMcq)
                    .setParameter("p_Num_TF", numTf);

            query.execute();

            // The stored procedure creates the exam and returns exam details
            // You don't need to return anything since it's inserted directly to database

        } catch (Exception e) {
            throw new RuntimeException("Error creating exam with random questions for course: " + courseName, e);
        }
    }

    @Override
    public ExamSubmissionResult submitExam(String ssn, Integer examId, List<String> answers) {
        try {
            // Convert List<String> to JSON array
            String answersJson = objectMapper.writeValueAsString(answers);

            StoredProcedureQuery query = entityManager
                    .createStoredProcedureQuery("Submit_Exam")
                    .registerStoredProcedureParameter("p_SSN", String.class, ParameterMode.IN)
                    .registerStoredProcedureParameter("p_Exam_ID", Integer.class, ParameterMode.IN)
                    .registerStoredProcedureParameter("p_Answers", String.class, ParameterMode.IN)
                    .setParameter("p_SSN", ssn)
                    .setParameter("p_Exam_ID", examId)
                    .setParameter("p_Answers", answersJson);

            query.execute();

            // Extract result from stored procedure output
            Object[] result = (Object[]) query.getSingleResult();

            return new ExamSubmissionResult(
                    ((Number) result[0]).intValue(),    // Attempt_ID
                    ((Number) result[1]).intValue(),    // Exam_ID
                    ((Number) result[2]).doubleValue(),  // Grade
                    (String) result[3]                   // Result_Message
            );

        } catch (Exception e) {
            throw new RuntimeException("Error submitting exam for student SSN: " + ssn + ", Exam ID: " + examId, e);
        }
    }

    @Override
    public List<Exam> selectAllByFilters(ExamSearchFilter filter) {
        return queryBuilder.selectAllByFilters(filter);
    }

    @Override
    public long countByFilters(ExamSearchFilter filter) {
        return queryBuilder.countAllByFilters(filter);
    }
}
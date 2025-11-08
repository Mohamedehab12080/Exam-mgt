package com.iti.training.exam.model.entities;


import com.iti.training.exam.model.entities.ids.ExamQuestionId;
import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "Assessment_Exam_Question")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@IdClass(ExamQuestionId.class)
public class ExamQuestion {
    @Id
    @ManyToOne
    @JoinColumn(name = "Question_ID", nullable = false)
    private Question question;

    @Id
    @ManyToOne
    @JoinColumn(name = "Exam_ID", nullable = false)
    private Exam exam;
}

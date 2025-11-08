package com.iti.training.exam.model.entities;

import com.iti.training.exam.model.entities.ids.AnswerId;
import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "Assessment_Answer")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@IdClass(AnswerId.class)
public class Answer {
    @Id
    @ManyToOne
    @JoinColumn(name = "Choice_ID", nullable = false)
    private Choice choice;

    @Id
    @ManyToOne
    @JoinColumn(name = "Question_ID", nullable = false)
    private Question question;

    @Id
    @ManyToOne
    @JoinColumn(name = "Attempt_ID", nullable = false)
    private Attempt attempt;

    @Column(name = "Is_Correct", nullable = false)
    private Boolean isCorrect;
}
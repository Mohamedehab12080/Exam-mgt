package com.iti.training.exam.model.entities;

import jakarta.persistence.*;
import lombok.*;

import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "Assessment_Choices")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Choice {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "Choice_ID")
    private Integer choiceId;

    @ManyToOne
    @JoinColumn(name = "Question_ID", nullable = false)
    private Question question;

    @Column(name = "Choice_Text", nullable = false, length = 300)
    private String choiceText;

    @Column(name = "Is_Correct", nullable = false)
    private Boolean isCorrect;

    @OneToMany(mappedBy = "choice", cascade = CascadeType.ALL)
    private List<Answer> answers = new ArrayList<>();
}
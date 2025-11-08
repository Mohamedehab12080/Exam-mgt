package com.iti.training.exam.model.entities;

import jakarta.persistence.*;
import lombok.*;

import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "Assessment_Question")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Question {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "Question_ID")
    private Integer questionId;

    @ManyToOne
    @JoinColumn(name = "Course_ID", nullable = false)
    private Course course;

    @Column(name = "Type", nullable = false, length = 10)
    private String type;

    @Column(name = "Question", nullable = false, length = 500)
    private String question;

    @OneToMany(mappedBy = "question", cascade = CascadeType.ALL)
    private List<Choice> choices = new ArrayList<>();

    @OneToMany(mappedBy = "question", cascade = CascadeType.ALL)
    private List<ExamQuestion> examQuestions = new ArrayList<>();

    @OneToMany(mappedBy = "question", cascade = CascadeType.ALL)
    private List<Answer> answers = new ArrayList<>();
}
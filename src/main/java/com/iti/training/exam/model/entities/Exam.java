package com.iti.training.exam.model.entities;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "Assessment_Exam")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Exam {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "Exam_ID")
    private Integer examId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "Course_ID", nullable = false)
    private Course course;

    @Column(name = "Title", nullable = false, length = 100)
    private String title;

    @Column(name = "Exam_Date", nullable = false)
    private LocalDate examDate;

    @Column(name = "Duration", nullable = false)
    private Integer duration;

    @OneToMany(mappedBy = "exam", cascade = CascadeType.ALL)
    private List<Attempt> attempts = new ArrayList<>();

    @OneToMany(mappedBy = "exam", cascade = CascadeType.ALL)
    private List<ExamQuestion> examQuestions = new ArrayList<>();
}
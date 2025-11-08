package com.iti.training.exam.model.entities;

import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "Assessment_Attempt")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Attempt {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "Attempt_ID")
    private Integer attemptId;

    @ManyToOne
    @JoinColumn(name = "SSN", nullable = false)
    private Student student;

    @ManyToOne
    @JoinColumn(name = "Exam_ID", nullable = false)
    private Exam exam;

    @Column(name = "Attempt_Date", nullable = false)
    private LocalDate attemptDate;

    // FIX THIS LINE - Remove precision and scale for Double type
    @Column(name = "grade", precision = 10, scale = 2)
    private BigDecimal grade;

    @OneToMany(mappedBy = "attempt", cascade = CascadeType.ALL)
    private List<Answer> answers = new ArrayList<>();
}
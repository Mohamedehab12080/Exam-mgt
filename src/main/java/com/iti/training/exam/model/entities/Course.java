package com.iti.training.exam.model.entities;

import jakarta.persistence.*;
import lombok.*;

import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "Learning_Course")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Course {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "Course_ID")
    private Integer courseId;

    @Column(name = "Course_Name", nullable = false, unique = true, length = 100)
    private String courseName;

    @Column(name = "Duration", nullable = false)
    private Integer duration;

    @OneToMany(mappedBy = "course", cascade = CascadeType.ALL)
    private List<Question> questions = new ArrayList<>();

    @OneToMany(mappedBy = "course", cascade = CascadeType.ALL)
    private List<Exam> exams = new ArrayList<>();
}
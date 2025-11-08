package com.iti.training.exam.model.entities;

import jakarta.persistence.*;
import lombok.Data;

@Entity
@Table(name = "Learning_Topic")
@Data
public class Topic {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "Topic_ID")
    private Integer topicId;

    @Column(name = "Topic_Name", nullable = false, length = 100)
    private String topicName;

    @ManyToOne
    @JoinColumn(name = "Course_ID", nullable = false)
    private Course course;

    @Column(name = "Duration", nullable = false)
    private Integer duration;

}
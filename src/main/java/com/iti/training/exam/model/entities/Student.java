package com.iti.training.exam.model.entities;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "usermanagement_student")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Student {
    @Id
    @Column(name = "SSN", columnDefinition = "CHAR(14)")
    private String ssn;

    @Column(name = "First_Name", nullable = false, length = 50)
    private String firstName;

    @Column(name = "Last_Name", nullable = false, length = 50)
    private String lastName;

    @Column(name = "Gender", nullable = false, length = 10)
    private String gender;

    @Column(name = "Birthdate", nullable = false)
    private LocalDate birthdate;

    @Column(name = "Email", nullable = false, unique = true, length = 100)
    private String email;

    @Column(name = "Phone", length = 11, nullable = false)
    private String phone;

    @Column(name = "Graduation_Year", nullable = false)
    private Integer graduationYear;

    @Column(name = "City", length = 50)
    private String city;

    @Column(name = "Age", insertable = false, updatable = false)
    private Integer age;

    @OneToMany(mappedBy = "student", cascade = CascadeType.ALL)
    private List<Attempt> attempts = new ArrayList<>();
}
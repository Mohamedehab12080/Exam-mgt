package com.iti.training.exam.model.vto;

import lombok.Data;
import java.time.LocalDate;
import java.util.List;

@Data
public class StudentView {
    private String ssn;
    private String firstName;
    private String lastName;
    private String gender;
    private LocalDate birthdate;
    private String email;
    private String phone;
    private Integer graduationYear;
    private String city;
    private Integer age;
    private List<AttemptView> attempts;
}
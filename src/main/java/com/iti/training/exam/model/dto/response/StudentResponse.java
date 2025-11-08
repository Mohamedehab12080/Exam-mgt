package com.iti.training.exam.model.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDate;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class StudentResponse {
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
}
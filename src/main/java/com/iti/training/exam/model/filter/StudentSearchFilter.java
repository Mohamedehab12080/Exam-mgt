package com.iti.training.exam.model.filter;

import com.iti.training.api.repository.model.SearchFilter;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.NoArgsConstructor;
import lombok.experimental.SuperBuilder;

@Data
@SuperBuilder
@EqualsAndHashCode(callSuper = true)
@NoArgsConstructor
@AllArgsConstructor
public class StudentSearchFilter extends SearchFilter {
    private String firstName;
    private String lastName;
    private String email;
    private String city;
    private Integer graduationYear;
    private String gender;
    private Integer minAge;
    private Integer maxAge;
}
package com.iti.training.exam.model.generated.student;

import java.net.URI;
import java.util.Objects;
import com.fasterxml.jackson.annotation.JsonProperty;
import com.fasterxml.jackson.annotation.JsonCreator;
import java.time.LocalDate;
import org.springframework.format.annotation.DateTimeFormat;
import java.io.Serializable;
import java.time.OffsetDateTime;
import jakarta.validation.Valid;
import jakarta.validation.constraints.*;
import org.hibernate.validator.constraints.*;
import io.swagger.v3.oas.annotations.media.Schema;


import java.util.*;
import jakarta.annotation.Generated;

/**
 * StudentDTO
 */
@lombok.Builder
@lombok.AllArgsConstructor
@lombok.NoArgsConstructor
@lombok.Data

@Generated(value = "org.openapitools.codegen.languages.SpringCodegen", comments = "Generator version: 7.6.0")
public class StudentDTO implements Serializable {

  private static final long serialVersionUID = 1L;

  private String ssn;

  private String firstName;

  private String lastName;

  private String gender;

  @DateTimeFormat(iso = DateTimeFormat.ISO.DATE)
  private LocalDate birthdate;

  private String email;

  private String phone;

  private Integer graduationYear;

  private String city;

}


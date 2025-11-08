package com.iti.training.exam.model.generated.student;

import java.net.URI;
import java.util.Objects;
import com.fasterxml.jackson.annotation.JsonProperty;
import com.fasterxml.jackson.annotation.JsonCreator;
import java.io.Serializable;
import java.time.OffsetDateTime;
import jakarta.validation.Valid;
import jakarta.validation.constraints.*;
import org.hibernate.validator.constraints.*;
import io.swagger.v3.oas.annotations.media.Schema;


import java.util.*;
import jakarta.annotation.Generated;

/**
 * StudentProgressView
 */
@lombok.Builder
@lombok.AllArgsConstructor
@lombok.NoArgsConstructor
@lombok.Data

@Generated(value = "org.openapitools.codegen.languages.SpringCodegen", comments = "Generator version: 7.6.0")
public class StudentProgressView implements Serializable {

  private static final long serialVersionUID = 1L;

  private String ssn;

  private String studentName;

  private String trackName;

  private Integer totalExamsTaken;

  private Integer passedExams;

  private Double overallAverage;

  private Double recentGrade;

  private String status;

}


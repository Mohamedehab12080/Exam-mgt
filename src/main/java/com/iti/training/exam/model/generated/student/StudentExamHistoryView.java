package com.iti.training.exam.model.generated.student;

import java.net.URI;
import java.util.Objects;
import com.fasterxml.jackson.annotation.JsonProperty;
import com.fasterxml.jackson.annotation.JsonCreator;
import java.time.LocalDateTime;
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
 * StudentExamHistoryView
 */
@lombok.Builder
@lombok.AllArgsConstructor
@lombok.NoArgsConstructor
@lombok.Data

@Generated(value = "org.openapitools.codegen.languages.SpringCodegen", comments = "Generator version: 7.6.0")
public class StudentExamHistoryView implements Serializable {

  private static final long serialVersionUID = 1L;

  private String studentSsn;

  private String studentName;

  private Integer examId;

  private String examTitle;

  private String courseName;

  @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME)
  private LocalDateTime attemptDate;

  private Double grade;

  private Integer attemptCount;

  private String status;

  private Integer duration;

  private Integer totalQuestions;

  private Integer correctAnswers;

}


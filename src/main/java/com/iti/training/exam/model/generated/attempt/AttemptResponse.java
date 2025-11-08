package com.iti.training.exam.model.generated.attempt;

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
 * AttemptResponse
 */
@lombok.Builder
@lombok.AllArgsConstructor
@lombok.NoArgsConstructor
@lombok.Data

@Generated(value = "org.openapitools.codegen.languages.SpringCodegen", comments = "Generator version: 7.6.0")
public class AttemptResponse implements Serializable {

  private static final long serialVersionUID = 1L;

  private Integer attemptId;

  private String studentSsn;

  private String studentName;

  private Integer examId;

  private String examTitle;

  @DateTimeFormat(iso = DateTimeFormat.ISO.DATE)
  private LocalDate attemptDate;

  private Double grade;

}


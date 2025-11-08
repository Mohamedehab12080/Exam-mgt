package com.iti.training.exam.model.generated.exam;

import java.net.URI;
import java.util.Objects;
import com.fasterxml.jackson.annotation.JsonProperty;
import com.fasterxml.jackson.annotation.JsonCreator;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;
import java.io.Serializable;
import java.time.OffsetDateTime;
import jakarta.validation.Valid;
import jakarta.validation.constraints.*;
import org.hibernate.validator.constraints.*;
import io.swagger.v3.oas.annotations.media.Schema;


import java.util.*;
import jakarta.annotation.Generated;

/**
 * ExamSubmissionDTO
 */
@lombok.Builder
@lombok.AllArgsConstructor
@lombok.NoArgsConstructor
@lombok.Data

@Generated(value = "org.openapitools.codegen.languages.SpringCodegen", comments = "Generator version: 7.6.0")
public class ExamSubmissionDTO implements Serializable {

  private static final long serialVersionUID = 1L;

  private String ssn;

  private Integer examId;

  @Valid
  private List<String> answers = new ArrayList<>();

}


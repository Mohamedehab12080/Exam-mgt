package com.iti.training.exam.model.generated.attempt;

import java.net.URI;
import java.util.Objects;
import com.fasterxml.jackson.annotation.JsonValue;
import java.io.Serializable;
import java.time.OffsetDateTime;
import jakarta.validation.Valid;
import jakarta.validation.constraints.*;
import org.hibernate.validator.constraints.*;
import io.swagger.v3.oas.annotations.media.Schema;


import java.util.*;
import jakarta.annotation.Generated;

import com.fasterxml.jackson.annotation.JsonCreator;
import com.fasterxml.jackson.annotation.JsonValue;

/**
 * Gets or Sets AttemptOrderBy
 */

@Generated(value = "org.openapitools.codegen.languages.SpringCodegen", comments = "Generator version: 7.6.0")
public enum AttemptOrderBy {
  
  ATTEMPTID("attemptId"),
  
  STUDENTSSN("studentSsn"),
  
  STUDENTNAME("studentName"),
  
  EXAMID("examId"),
  
  EXAMTITLE("examTitle"),
  
  ATTEMPTDATE("attemptDate"),
  
  GRADE("grade");

  private String value;

  AttemptOrderBy(String value) {
    this.value = value;
  }

  @JsonValue
  public String getValue() {
    return value;
  }

  @Override
  public String toString() {
    return String.valueOf(value);
  }

  @JsonCreator
  public static AttemptOrderBy fromValue(String value) {
    for (AttemptOrderBy b : AttemptOrderBy.values()) {
      if (b.value.equals(value)) {
        return b;
      }
    }
    throw new IllegalArgumentException("Unexpected value '" + value + "'");
  }
}


package com.iti.training.exam.model.generated.course;

import java.net.URI;
import java.util.Objects;
import com.fasterxml.jackson.annotation.JsonProperty;
import com.fasterxml.jackson.annotation.JsonCreator;
import com.iti.training.exam.model.vto.CourseStatisticsView;
import com.iti.training.exam.model.vto.ExamView;
import com.iti.training.exam.model.vto.QuestionView;
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
 * CourseView
 */
@lombok.Builder
@lombok.AllArgsConstructor
@lombok.NoArgsConstructor
@lombok.Data

@Generated(value = "org.openapitools.codegen.languages.SpringCodegen", comments = "Generator version: 7.6.0")
public class CourseView implements Serializable {

  private static final long serialVersionUID = 1L;

  private Integer courseId;

  private String courseName;

  private Integer duration;

  @Valid
  private List<@Valid QuestionView> questions = new ArrayList<>();

  @Valid
  private List<@Valid ExamView> exams = new ArrayList<>();

  private CourseStatisticsView statistics;

}


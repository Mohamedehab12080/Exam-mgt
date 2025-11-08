package com.iti.training.exam.model.generated.student;

import java.net.URI;
import java.util.Objects;
import com.fasterxml.jackson.annotation.JsonProperty;
import com.fasterxml.jackson.annotation.JsonCreator;
import com.fasterxml.jackson.annotation.JsonTypeName;
import java.io.Serializable;
import java.time.OffsetDateTime;
import jakarta.validation.Valid;
import jakarta.validation.constraints.*;
import org.hibernate.validator.constraints.*;
import io.swagger.v3.oas.annotations.media.Schema;


import java.util.*;
import jakarta.annotation.Generated;

/**
 * ModelApiResponse
 */
@lombok.Builder
@lombok.AllArgsConstructor
@lombok.NoArgsConstructor
@lombok.Data

@JsonTypeName("ApiResponse")
@Generated(value = "org.openapitools.codegen.languages.SpringCodegen", comments = "Generator version: 7.6.0")
public class ModelApiResponse implements Serializable {

  private static final long serialVersionUID = 1L;

  private Boolean success;

  private String message;

  private Object data;

}


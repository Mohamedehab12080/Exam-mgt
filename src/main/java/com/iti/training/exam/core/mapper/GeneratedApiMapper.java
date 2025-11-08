//package com.iti.training.exam.core.mapper;
//
//import com.iti.training.exam.core.controller.config.ApiResponse;
//import com.iti.training.exam.model.generated.attempt.*;
//import com.iti.training.exam.model.generated.choice.*;
//import org.mapstruct.Mapper;
//import org.mapstruct.Mapping;
//
//import java.time.OffsetDateTime;
//
//@Mapper(componentModel = "spring")
//public interface GeneratedApiMapper {
//
//    // Specific mappings for each type
//    @Mapping(target = "timestamp", expression = "java(java.time.OffsetDateTime.now())")
//    @Mapping(source = "message", target = "message")
//    @Mapping(source = "data", target = "data")
//    ApiResponseAttemptResponse toGeneratedApiResponse(ApiResponse<AttemptResponse> response);
//
//    @Mapping(target = "timestamp", expression = "java(java.time.OffsetDateTime.now())")
//    @Mapping(source = "message", target = "message")
//    @Mapping(source = "data", target = "data")
//    ApiResponseLong toGeneratedApiResponse(ApiResponse<Long> response);
//
//    @Mapping(target = "timestamp", expression = "java(java.time.OffsetDateTime.now())")
//    @Mapping(source = "message", target = "message")
//    @Mapping(source = "data", target = "data")
//    ApiResponseChoiceResponse toGeneratedApiResponse(ApiResponse<ChoiceResponse> response);
//
//    // Default method to handle message/error logic
//    default String mapMessage(ApiResponse<?> response) {
//        if (response.getMessage() != null) {
//            return response.getMessage();
//        } else if (response.getError() != null) {
//            return response.getError();
//        }
//        return null;
//    }
//
//    // Default method for timestamp
//    default OffsetDateTime mapTimestamp() {
//        return OffsetDateTime.now();
//    }
//}
package com.iti.training.exam.core.controller.config;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import com.fasterxml.jackson.annotation.JsonInclude;
import org.springframework.http.HttpStatus;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@JsonInclude(JsonInclude.Include.NON_NULL)
public class ApiResponse<T> {
    private boolean success;
    private String message;
    private T data;
    private String error;
    private int status;

    public static <T> ApiResponse<T> success(T data) {
        return ApiResponse.<T>builder()
                .success(true)
                .data(data)
                .status(HttpStatus.OK.value())
                .build();
    }

    public static <T> ApiResponse<T> success(String message, T data) {
        return ApiResponse.<T>builder()
                .success(true)
                .message(message)
                .data(data)
                .status(HttpStatus.OK.value())
                .build();
    }

    public static <T> ApiResponse<T> created(String message, T data) {
        return ApiResponse.<T>builder()
                .success(true)
                .message(message)
                .data(data)
                .status(HttpStatus.CREATED.value())
                .build();
    }

    public static <T> ApiResponse<T> error(String error) {
        return ApiResponse.<T>builder()
                .success(false)
                .error(error)
                .status(HttpStatus.BAD_REQUEST.value())
                .build();
    }

    public static <T> ApiResponse<T> error(String error, HttpStatus status) {
        return ApiResponse.<T>builder()
                .success(false)
                .error(error)
                .status(status.value())
                .build();
    }

    public static <T> ApiResponse<T> notFound(String error) {
        return ApiResponse.<T>builder()
                .success(false)
                .error(error)
                .status(HttpStatus.NOT_FOUND.value())
                .build();
    }

    public static <T> ApiResponse<T> conflict(String error) {
        return ApiResponse.<T>builder()
                .success(false)
                .error(error)
                .status(HttpStatus.CONFLICT.value())
                .build();
    }

    public static <T> ApiResponse<T> internalError(String error) {
        return ApiResponse.<T>builder()
                .success(false)
                .error(error)
                .status(HttpStatus.INTERNAL_SERVER_ERROR.value())
                .build();
    }
}
package com.iti.training.api.service;

import com.iti.training.exam.core.controller.config.ApiResponse;
import com.iti.training.exam.model.generated.student.StudentDTO;
import com.iti.training.exam.model.dto.response.StudentResponse;
import com.iti.training.exam.model.filter.StudentSearchFilter;
import com.iti.training.exam.model.vto.StudentProgressView;
import com.iti.training.exam.model.vto.StudentExamHistoryView;
import com.iti.training.exam.model.vto.StudentView;

import java.util.List;

public interface IStudentService {
    // Basic CRUD operations
    ApiResponse<StudentResponse> createStudent(StudentDTO studentDTO);
    ApiResponse<StudentResponse> updateStudent(String ssn, StudentDTO studentDTO);
    ApiResponse<Void> deleteStudent(String ssn);
    ApiResponse<Boolean> existsBySsn(String ssn);

    // Progress and reporting
    ApiResponse<StudentProgressView> getStudentProgress(String ssn);
    ApiResponse<List<StudentProgressView>> getAllStudentsProgressByFilter(StudentSearchFilter filter);
    ApiResponse<List<StudentExamHistoryView>> getStudentExamHistory(String ssn);

    ApiResponse<StudentView> getStudentBySsn(String ssn);
    // Filtering and pagination
    ApiResponse<List<StudentView>> getAllByFilters(StudentSearchFilter filter);
    ApiResponse<Long> countStudents(StudentSearchFilter filter);
}
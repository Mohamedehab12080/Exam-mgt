package com.iti.training.exam.core.controller.Impl;

import com.iti.training.api.repository.model.PaginationInfo;
import com.iti.training.api.repository.model.SortingInfo;
import com.iti.training.exam.core.controller.config.ApiResponse;
import com.iti.training.exam.core.controller.generated.student.StudentsController;
import com.iti.training.exam.model.generated.student.StudentDTO;
import com.iti.training.exam.model.dto.response.StudentResponse;
import com.iti.training.exam.model.vto.StudentProgressView;
import com.iti.training.exam.model.vto.StudentExamHistoryView;
import com.iti.training.exam.model.vto.StudentView;
import com.iti.training.exam.model.filter.StudentSearchFilter;
import com.iti.training.api.service.IStudentService;
import lombok.AllArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@AllArgsConstructor
public class StudentControllerImpl implements StudentsController {

    private final IStudentService studentService;

    @Override
    public ResponseEntity<ApiResponse> _countStudents(String firstName, String lastName, String email,
                                                      String city, Integer graduationYear, String gender,
                                                      Integer minAge, Integer maxAge) {
        StudentSearchFilter filter = buildSearchFilter(firstName, lastName, email, city, graduationYear,
                gender, minAge, maxAge, null, null, null, null, null);
        ApiResponse<Long> response = studentService.countStudents(filter);
        return ResponseEntity.status(response.getStatus()).body(response);
    }

    @Override
    public ResponseEntity<ApiResponse> _createStudent(StudentDTO studentDTO) {
        ApiResponse<StudentResponse> response = studentService.createStudent(studentDTO);
        return ResponseEntity.status(response.getStatus()).body(response);
    }

    @Override
    public ResponseEntity<ApiResponse> _deleteStudent(String ssn) {
        ApiResponse<Void> response = studentService.deleteStudent(ssn);
        return ResponseEntity.status(response.getStatus()).body(response);
    }

    @Override
    public ResponseEntity<ApiResponse> _existsBySsn(String ssn) {
        ApiResponse<Boolean> response = studentService.existsBySsn(ssn);
        return ResponseEntity.status(response.getStatus()).body(response);
    }

    @Override
    public ResponseEntity<ApiResponse> _getAllByFilters(String firstName, String lastName,
                                                        String email, String city,
                                                        Integer graduationYear, String gender,
                                                        Integer minAge, Integer maxAge,
                                                        Integer pageNum, Integer pageSize,
                                                        Boolean noPagination, String sortBy,
                                                        String sortDir) {
        StudentSearchFilter filter = buildSearchFilter(firstName, lastName, email, city, graduationYear,
                gender, minAge, maxAge, pageNum, pageSize, noPagination,
                sortBy, sortDir);
        ApiResponse<List<StudentView>> response = studentService.getAllByFilters(filter);
        return ResponseEntity.status(response.getStatus()).body(response);
    }

    @Override
    public ResponseEntity<ApiResponse> _getAllStudentsProgressByFilter(String firstName,
                                                                       String lastName,
                                                                       String email,
                                                                       String city,
                                                                       Integer graduationYear,
                                                                       String gender,
                                                                       Integer minAge,
                                                                       Integer maxAge,
                                                                       Integer pageNum,
                                                                       Integer pageSize,
                                                                       Boolean noPagination) {
        StudentSearchFilter filter = buildSearchFilter(firstName, lastName, email, city, graduationYear,
                gender, minAge, maxAge, pageNum, pageSize, noPagination,
                null, null);
        ApiResponse<List<StudentProgressView>> response = studentService.getAllStudentsProgressByFilter(filter);
        return ResponseEntity.status(response.getStatus()).body(response);
    }

    @Override
    public ResponseEntity<ApiResponse> _getStudentBySsn(String ssn) {
        ApiResponse<StudentView> response = studentService.getStudentBySsn(ssn);
        return ResponseEntity.status(response.getStatus()).body(response);
    }

    @Override
    public ResponseEntity<ApiResponse> _getStudentExamHistory(String ssn) {
        ApiResponse<List<StudentExamHistoryView>> response = studentService.getStudentExamHistory(ssn);
        return ResponseEntity.status(response.getStatus()).body(response);
    }

    @Override
    public ResponseEntity<ApiResponse> _getStudentProgress(String ssn) {
        ApiResponse<StudentProgressView> response = studentService.getStudentProgress(ssn);
        return ResponseEntity.status(response.getStatus()).body(response);
    }

    @Override
    public ResponseEntity<ApiResponse> _updateStudent(String ssn, StudentDTO studentDTO) {
        ApiResponse<StudentResponse> response = studentService.updateStudent(ssn, studentDTO);
        return ResponseEntity.status(response.getStatus()).body(response);
    }

    /**
     * Build StudentSearchFilter from query parameters
     */
    private StudentSearchFilter buildSearchFilter(String firstName, String lastName, String email,
                                                  String city, Integer graduationYear, String gender,
                                                  Integer minAge, Integer maxAge, Integer pageNum,
                                                  Integer pageSize, Boolean noPagination, String sortBy,
                                                  String sortDir) {

        PaginationInfo pagination = null;
        if (pageNum != null || pageSize != null || noPagination != null) {
            pagination = PaginationInfo.builder()
                    .pageNum(pageNum != null ? pageNum : 0)
                    .pageSize(pageSize != null ? pageSize : 25)
                    .noPagination(noPagination != null ? noPagination : false)
                    .build();
        }

        SortingInfo sorting = null;
        if (sortBy != null) {
            sorting = SortingInfo.builder()
                    .by(sortBy)
                    .dir(sortDir != null ? sortDir : "ASC")
                    .build();
        }

        return StudentSearchFilter.builder()
                .firstName(firstName)
                .lastName(lastName)
                .email(email)
                .city(city)
                .graduationYear(graduationYear)
                .gender(gender)
                .minAge(minAge)
                .maxAge(maxAge)
                .pagination(pagination)
                .sorting(sorting)
                .build();
    }
}
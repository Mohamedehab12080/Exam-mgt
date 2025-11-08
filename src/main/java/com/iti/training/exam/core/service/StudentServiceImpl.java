package com.iti.training.exam.core.service;

import com.iti.training.api.service.IStudentService;
import com.iti.training.exam.core.controller.config.ApiResponse;
import com.iti.training.exam.core.mapper.StudentMapper;
import com.iti.training.exam.core.mapper.StudentProgressViewMapper;
import com.iti.training.exam.core.mapper.StudentExamHistoryMapper;
import com.iti.training.exam.model.generated.student.StudentDTO;
import com.iti.training.exam.model.dto.response.StudentResponse;
import com.iti.training.exam.model.entities.Student;
import com.iti.training.exam.model.filter.StudentSearchFilter;
import com.iti.training.exam.model.vto.StudentProgressView;
import com.iti.training.exam.model.vto.StudentExamHistoryView;
import com.iti.training.exam.model.vto.StudentView;
import com.iti.training.api.repository.StudentRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;

@Slf4j
@Service
@RequiredArgsConstructor
@Transactional
public class StudentServiceImpl implements IStudentService {

    private final StudentRepository studentRepository;
    private final StudentMapper studentMapper;
    private final StudentProgressViewMapper studentProgressViewMapper;
    private final StudentExamHistoryMapper studentExamHistoryMapper;

    @Override
    @Transactional
    public ApiResponse<StudentResponse> createStudent(StudentDTO studentDTO) {
        try {
            log.info("Creating new student with SSN: {}", studentDTO.getSsn());

            // Check if student already exists
            if (studentRepository.existsById(studentDTO.getSsn())) {
                return ApiResponse.conflict("Student with SSN " + studentDTO.getSsn() + " already exists");
            }

            // Convert DTO to entity and save
            Student student = studentMapper.toEntity(studentDTO);
            Student savedStudent = studentRepository.insert(student);

            // Convert to response
            StudentResponse response = convertToResponse(savedStudent);

            return ApiResponse.created("Student created successfully", response);

        } catch (Exception e) {
            log.error("Error creating student with SSN: {}", studentDTO.getSsn(), e);
            return ApiResponse.error("Failed to create student: " + e.getMessage());
        }
    }

    @Override
    @Transactional
    public ApiResponse<StudentResponse> updateStudent(String ssn, StudentDTO studentDTO) {
        try {
            log.info("Updating student with SSN: {}", ssn);

            // Find existing student
            Optional<Student> existingStudentOpt = studentRepository.selectById(ssn);
            if (existingStudentOpt.isEmpty()) {
                return ApiResponse.notFound("Student with SSN " + ssn + " not found");
            }

            Student existingStudent = existingStudentOpt.get();

            // Update fields
            updateEntityFromDTO(existingStudent, studentDTO);
            Student updatedStudent = studentRepository.insert(existingStudent);

            // Convert to response
            StudentResponse response = convertToResponse(updatedStudent);

            return ApiResponse.success("Student updated successfully", response);

        } catch (Exception e) {
            log.error("Error updating student with SSN: {}", ssn, e);
            return ApiResponse.error("Failed to update student: " + e.getMessage());
        }
    }

    @Override
    @Transactional
    public ApiResponse<Void> deleteStudent(String ssn) {
        try {
            log.info("Deleting student with SSN: {}", ssn);

            if (!studentRepository.existsById(ssn)) {
                return ApiResponse.notFound("Student with SSN " + ssn + " not found");
            }

            studentRepository.deleteById(ssn);

            return ApiResponse.success("Student deleted successfully", null);

        } catch (Exception e) {
            log.error("Error deleting student with SSN: {}", ssn, e);
            return ApiResponse.error("Failed to delete student: " + e.getMessage());
        }
    }

    @Override
    @Transactional(readOnly = true)
    public ApiResponse<Boolean> existsBySsn(String ssn) {
        try {
            boolean exists = studentRepository.existsById(ssn);
            String message = exists ? "Student exists" : "Student does not exist";
            return ApiResponse.success(message, exists);
        } catch (Exception e) {
            log.error("Error checking student existence with SSN: {}", ssn, e);
            return ApiResponse.internalError("Failed to check student existence");
        }
    }

    @Override
    @Transactional(readOnly = true)
    public ApiResponse<StudentProgressView> getStudentProgress(String ssn) {
        try {
            log.info("Fetching progress for student with SSN: {}", ssn);

            Optional<Student> studentOpt = studentRepository.selectById(ssn);
            if (studentOpt.isEmpty()) {
                return ApiResponse.notFound("Student with SSN " + ssn + " not found");
            }

            Student student = studentOpt.get();
            StudentProgressView progress = studentProgressViewMapper.toProgressView(student);

            return ApiResponse.success("Student progress retrieved successfully", progress);

        } catch (Exception e) {
            log.error("Error fetching progress for student with SSN: {}", ssn, e);
            return ApiResponse.internalError("Failed to fetch student progress");
        }
    }

    @Override
    @Transactional(readOnly = true)
    public ApiResponse<List<StudentProgressView>> getAllStudentsProgressByFilter(StudentSearchFilter filter) {
        try {
            log.info("Fetching students progress with filter");

            List<Student> students = studentRepository.selectAllByFilters(filter);
            List<StudentProgressView> progressList = students.stream()
                    .map(studentProgressViewMapper::toProgressView)
                    .toList();

            return ApiResponse.success("Found " + progressList.size() + " students", progressList);

        } catch (Exception e) {
            log.error("Error fetching students progress with filter", e);
            return ApiResponse.internalError("Failed to fetch students progress");
        }
    }

    @Override
    @Transactional(readOnly = true)
    public ApiResponse<List<StudentExamHistoryView>> getStudentExamHistory(String ssn) {
        try {
            log.info("Fetching exam history for student with SSN: {}", ssn);

            Optional<Student> studentOpt = studentRepository.selectById(ssn);
            if (studentOpt.isEmpty()) {
                return ApiResponse.notFound("Student with SSN " + ssn + " not found");
            }

            Student student = studentOpt.get();
            List<StudentExamHistoryView> examHistory = studentExamHistoryMapper.toHistoryViews(student.getAttempts());

            return ApiResponse.success("Exam history retrieved successfully", examHistory);

        } catch (Exception e) {
            log.error("Error fetching exam history for student with SSN: {}", ssn, e);
            return ApiResponse.internalError("Failed to fetch exam history");
        }
    }

    @Override
    @Transactional(readOnly = true)
    public ApiResponse<StudentView> getStudentBySsn(String ssn) {
        try {
            log.info("Fetching student with SSN: {}", ssn);

            Optional<Student> studentOpt = studentRepository.selectById(ssn);
            if (studentOpt.isEmpty()) {
                return ApiResponse.notFound("Student with SSN " + ssn + " not found");
            }

            StudentView studentView = studentMapper.toDetailedView(studentOpt.get());

            return ApiResponse.success("Student retrieved successfully", studentView);

        } catch (Exception e) {
            log.error("Error fetching student with SSN: {}", ssn, e);
            return ApiResponse.internalError("Failed to fetch student");
        }
    }

    @Override
    @Transactional(readOnly = true)
    public ApiResponse<List<StudentView>> getAllByFilters(StudentSearchFilter filter) {
        try {
            log.info("Fetching students with filters");

            List<Student> students = studentRepository.selectAllByFilters(filter);
            List<StudentView> studentViews = studentMapper.toBasicViewList(students);

            return ApiResponse.success("Found " + studentViews.size() + " students", studentViews);

        } catch (Exception e) {
            log.error("Error fetching students with filters", e);
            return ApiResponse.internalError("Failed to fetch students");
        }
    }

    @Override
    @Transactional(readOnly = true)
    public ApiResponse<Long> countStudents(StudentSearchFilter filter) {
        try {
            long count = studentRepository.countByFilters(filter);
            return ApiResponse.success("Total students: " + count, count);

        } catch (Exception e) {
            log.error("Error counting students with filters", e);
            return ApiResponse.internalError("Failed to count students");
        }
    }

    private void updateEntityFromDTO(Student student, StudentDTO dto) {
        if (dto.getFirstName() != null) student.setFirstName(dto.getFirstName());
        if (dto.getLastName() != null) student.setLastName(dto.getLastName());
        if (dto.getGender() != null) student.setGender(dto.getGender());
        if (dto.getBirthdate() != null) student.setBirthdate(dto.getBirthdate());
        if (dto.getEmail() != null) student.setEmail(dto.getEmail());
        if (dto.getPhone() != null) student.setPhone(dto.getPhone());
        if (dto.getGraduationYear() != null) student.setGraduationYear(dto.getGraduationYear());
        if (dto.getCity() != null) student.setCity(dto.getCity());
    }

    private StudentResponse convertToResponse(Student student) {
        // Implement conversion from Student to StudentResponse
        // This might use a separate mapper
        return StudentResponse.builder()
                .ssn(student.getSsn())
                .firstName(student.getFirstName())
                .lastName(student.getLastName())
                .email(student.getEmail())
                .phone(student.getPhone())
                .graduationYear(student.getGraduationYear())
                .city(student.getCity())
                .build();
    }
}
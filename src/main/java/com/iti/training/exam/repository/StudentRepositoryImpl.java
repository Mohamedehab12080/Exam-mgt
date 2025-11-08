package com.iti.training.exam.repository;

import com.iti.training.api.repository.StudentRepository;
import com.iti.training.exam.model.entities.Student;
import com.iti.training.exam.model.filter.StudentSearchFilter;
import com.iti.training.exam.repository.jpa.StudentJPARepository;
import com.iti.training.exam.repository.query.StudentQueryBuilder;
import lombok.AllArgsConstructor;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
@AllArgsConstructor
public class StudentRepositoryImpl implements StudentRepository {

    private final StudentJPARepository studentJPARepository;
    private final StudentQueryBuilder studentQueryBuilder;

    @Override
    public Student insert(Student student) {
        return studentJPARepository.save(student);
    }

    @Override
    public Optional<Student> selectById(String ssn) {
        return studentJPARepository.findById(ssn);
    }

    @Override
    public void deleteById(String ssn) {
        studentJPARepository.deleteById(ssn);
    }

    @Override
    public boolean existsById(String ssn) {
        return studentJPARepository.existsById(ssn);
    }

    @Override
    public List<Student> selectAllByFilters(StudentSearchFilter filter) {
        return studentQueryBuilder.selectAllByFilters(filter);
    }

    @Override
    public long countByFilters(StudentSearchFilter filter) {
        return studentQueryBuilder.countAllByFilters(filter);
    }
}

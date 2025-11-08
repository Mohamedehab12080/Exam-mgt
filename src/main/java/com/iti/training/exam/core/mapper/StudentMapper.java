package com.iti.training.exam.core.mapper;

import com.iti.training.exam.model.entities.Student;
import com.iti.training.exam.model.generated.student.*;
import com.iti.training.exam.model.vto.StudentView;
import org.mapstruct.*;

import java.util.List;

@Mapper(componentModel = "spring", uses = AttemptMapper.class)
public interface StudentMapper {

    @Named("toDetailedView")
    @Mapping(source = "attempts", target = "attempts")
    StudentView toDetailedView(Student student);

    @Named("toBasicView")
    @Mapping(target = "attempts", ignore = true)
    StudentView toBasicView(Student student);

    // Use @IterableMapping with qualifiedByName
    @IterableMapping(qualifiedByName = "toDetailedView")
    List<StudentView> toDetailedViewList(List<Student> students);

    @IterableMapping(qualifiedByName = "toBasicView")
    List<StudentView> toBasicViewList(List<Student> students);

    // Convert StudentDTO to Student Entity
    @Mapping(target = "age", ignore = true)
    @Mapping(target = "attempts", ignore = true)
    Student toEntity(StudentDTO studentDTO);

    StudentDTO toDTO(Student student);

    @Mapping(target = "ssn", ignore = true)
    @Mapping(target = "age", ignore = true)
    @Mapping(target = "attempts", ignore = true)
    Student updateEntityFromDTO(StudentDTO studentDTO);
}
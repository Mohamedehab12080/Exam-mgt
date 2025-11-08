package com.iti.training.exam.core.mapper;

import com.iti.training.api.repository.ExamRepository;
import com.iti.training.exam.model.dto.ExamDTO;
import com.iti.training.exam.model.dto.response.ExamResponse;
import com.iti.training.exam.model.dto.response.ExamResultResponse;
import com.iti.training.exam.model.entities.Exam;
import com.iti.training.exam.model.vto.ExamView;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

@Mapper(componentModel = "spring", uses = {QuestionMapper.class})
public abstract class ExamMapper {

    public abstract ExamResponse toResponse(ExamDTO examDTO);

    public abstract ExamResponse toResponse(Exam exam);

    public abstract ExamResultResponse toExamResultResponse(ExamRepository.ExamSubmissionResult examSubmissionResult);

    @Mapping(target = "courseName", source = "course.courseName")
    @Mapping(target = "questions", source = "examQuestions")
    public abstract ExamView toExamView(Exam exam);
}
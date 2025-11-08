package com.iti.training.exam.core.mapper;

import com.iti.training.exam.model.entities.Answer;
import com.iti.training.exam.model.vto.AnswerView;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

import java.util.List;

@Mapper(componentModel = "spring", uses = {AttemptMapper.class, ChoiceMapper.class, QuestionMapper.class})
public abstract class AnswerMapper {

    @Mapping(source = "choice", target = "choice")
    @Mapping(source = "question", target = "question")
    @Mapping(source = "isCorrect", target = "isCorrect")
    @Mapping(source = "attempt.attemptId",target = "attemptId")
    public abstract AnswerView toAnswerView(Answer answer);

    public abstract List<AnswerView> toAnswerViews(List<Answer> answers);
}

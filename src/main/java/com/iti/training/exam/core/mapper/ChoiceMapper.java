package com.iti.training.exam.core.mapper;

import com.iti.training.exam.model.dto.ChoiceDTO;
import com.iti.training.exam.model.dto.response.ChoiceResponse;
import com.iti.training.exam.model.entities.Choice;
import com.iti.training.exam.model.entities.Question;
import com.iti.training.exam.model.vto.ChoiceView;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.Named;

@Mapper(componentModel = "spring")
public abstract class ChoiceMapper {

    @Mapping(source = "question.questionId", target = "questionId")
    public abstract ChoiceResponse toResponse(Choice choice);

    @Mapping(source = "questionId", target = "question.questionId")
    public abstract Choice toChoice(ChoiceDTO choiceDTO);

    public abstract ChoiceView toChoiceView(Choice choice);



    @Named("questionIdToQuestion")
    public Question questionIdToQuestion(Integer questionId) {
        if (questionId == null) return null;
        Question question = new Question();
        question.setQuestionId(questionId);
        return question;
    }

}

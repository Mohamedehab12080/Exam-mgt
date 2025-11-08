package com.iti.training.exam.model.entities.ids;


import java.io.Serializable;

// Composite ID Class
public class ExamQuestionId implements Serializable {
    private Integer question;
    private Integer exam;

    // Default constructor
    public ExamQuestionId() {
    }

    public ExamQuestionId(Integer question, Integer exam) {
        this.question = question;
        this.exam = exam;
    }

    // equals and hashCode methods
    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (!(o instanceof ExamQuestionId)) return false;
        ExamQuestionId that = (ExamQuestionId) o;
        return question.equals(that.question) && exam.equals(that.exam);
    }

    @Override
    public int hashCode() {
        return java.util.Objects.hash(question, exam);
    }

}
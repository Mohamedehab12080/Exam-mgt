package com.iti.training.exam.model.entities.ids;


import java.io.Serializable;

// Composite ID Class
public class AnswerId implements Serializable {

    private Integer choice;
    private Integer question;
    private Integer attempt;

    // Default constructor
    public AnswerId() {
    }

    public AnswerId(Integer choice, Integer question, Integer attempt) {
        this.choice = choice;
        this.question = question;
        this.attempt = attempt;
    }

    // equals and hashCode methods
    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (!(o instanceof AnswerId)) return false;
        AnswerId that = (AnswerId) o;
        return choice.equals(that.choice) &&
                question.equals(that.question) &&
                attempt.equals(that.attempt);
    }

    @Override
    public int hashCode() {
        return java.util.Objects.hash(choice, question, attempt);
    }

}

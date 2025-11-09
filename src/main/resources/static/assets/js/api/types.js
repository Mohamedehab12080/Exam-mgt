// types.js - Comprehensive Type Definitions for All Services

// ==================== STUDENT SERVICE ====================

/**
 * @typedef {Object} StudentDTO
 * @property {string} ssn - Required, pattern: ^\d{14}$
 * @property {string} firstName - Required, maxLength: 50
 * @property {string} lastName - Required, maxLength: 50
 * @property {string} gender - Required, maxLength: 10
 * @property {string} birthdate - Required, ISO date string
 * @property {string} email - Required, format: email, maxLength: 100
 * @property {string} phone - Required, pattern: ^\d{11}$
 * @property {number} graduationYear - Required, minimum: 2000, maximum: 2030
 * @property {string} [city] - maxLength: 50
 */

/**
 * @typedef {Object} StudentView
 * @property {string} ssn
 * @property {string} firstName
 * @property {string} lastName
 * @property {string} gender
 * @property {string} birthdate - ISO date string
 * @property {string} email
 * @property {string} phone
 * @property {number} graduationYear
 * @property {string} city
 * @property {number} age - Calculated age
 * @property {AttemptView[]} attempts - Student's exam attempts
 */

/**
 * @typedef {Object} StudentProgressView
 * @property {string} ssn
 * @property {string} studentName
 * @property {string} trackName
 * @property {number} totalExamsTaken
 * @property {number} passedExams
 * @property {number} overallAverage
 * @property {number} recentGrade
 * @property {string} status
 */

/**
 * @typedef {Object} StudentExamHistoryView
 * @property {string} studentSsn
 * @property {string} studentName
 * @property {number} examId
 * @property {string} examTitle
 * @property {string} courseName
 * @property {string} attemptDate - ISO date string
 * @property {number} grade
 * @property {number} attemptCount
 * @property {string} status - PASSED/FAILED
 * @property {number} courseAverage - For comparison
 * @property {number} duration - Exam duration in minutes
 * @property {number} totalQuestions
 * @property {number} correctAnswers
 */

/**
 * @typedef {Object} StudentFilters
 * @property {string} [firstName]
 * @property {string} [lastName]
 * @property {string} [email]
 * @property {string} [city]
 * @property {number} [graduationYear]
 * @property {string} [gender]
 * @property {number} [minAge]
 * @property {number} [maxAge]
 * @property {number} [pageNum] - Page number (default: 0)
 * @property {number} [pageSize] - Page size (default: 25, min: 10, max: 100)
 * @property {boolean} [noPagination]
 * @property {string} [sortBy] - ssn, firstName, lastName, email, city, graduationYear, gender, birthdate, phone
 * @property {string} [sortDir] - ASC, DESC
 */

// ==================== ATTEMPT SERVICE ====================

/**
 * @typedef {Object} AttemptResponse
 * @property {number} attemptId
 * @property {string} studentSsn
 * @property {string} studentName
 * @property {number} examId
 * @property {string} examTitle
 * @property {string} attemptDate - ISO date string (YYYY-MM-DD)
 * @property {number} grade - Double precision number
 */

/**
 * @typedef {Object} AttemptView
 * @property {number} attemptId
 * @property {string} studentSsn
 * @property {string} studentName
 * @property {number} examId
 * @property {string} examTitle
 * @property {string} attemptDate - ISO date string
 * @property {number} grade
 * @property {string} status - PASSED/FAILED
 * @property {number} duration
 * @property {number} totalQuestions
 * @property {number} correctAnswers
 */

/**
 * @typedef {Object} AttemptFilters
 * @property {string} [studentSsn]
 * @property {number} [examId]
 * @property {string} [attemptDate] - ISO date string (YYYY-MM-DD)
 * @property {number} [page] - Page number (default: 0)
 * @property {number} [size] - Page size (default: 20, min: 1, max: 100)
 * @property {string} [sortBy] - attemptId, studentSsn, studentName, examId, examTitle, attemptDate, grade
 * @property {string} [sortDir] - ASC, DESC
 */

// ==================== CHOICE SERVICE ====================

/**
 * @typedef {Object} ChoiceDTO
 * @property {number} questionId - Required
 * @property {string} choiceText - Required, maxLength: 300
 * @property {boolean} isCorrect - Required
 */

/**
 * @typedef {Object} ChoiceResponse
 * @property {number} choiceId
 * @property {number} questionId
 * @property {string} choiceText
 * @property {boolean} isCorrect
 */

/**
 * @typedef {Object} ChoiceView
 * @property {number} choiceId
 * @property {string} choiceText
 * @property {boolean} isCorrect
 */

/**
 * @typedef {Object} ChoiceFilters
 * @property {number} [questionId]
 * @property {string} [choiceText]
 * @property {boolean} [isCorrect]
 * @property {number} [page] - Page number (default: 0)
 * @property {number} [size] - Page size (default: 20, min: 1, max: 100)
 * @property {string} [sortBy] - choiceId, questionId, choiceText, isCorrect
 * @property {string} [sortDir] - ASC, DESC
 */

// ==================== COURSE SERVICE ====================

/**
 * @typedef {Object} CourseDTO
 * @property {string} courseName - Required, maxLength: 100
 * @property {number} duration - Required, minimum: 1
 */

/**
 * @typedef {Object} CourseStatistics
 * @property {number} totalExams
 * @property {number} totalQuestions
 * @property {number} mcqCount
 * @property {number} tfCount
 * @property {number} averageGrade
 * @property {number} totalAttempts
 * @property {number} totalStudents
 */

/**
 * @typedef {Object} CourseResponse
 * @property {number} courseId
 * @property {string} courseName
 * @property {number} duration
 * @property {QuestionSummary[]} [questions]
 */

/**
 * @typedef {Object} CourseView
 * @property {number} courseId
 * @property {string} courseName
 * @property {number} duration
 * @property {QuestionView[]} questions
 * @property {ExamView[]} exams
 * @property {CourseStatistics} statistics
 */

/**
 * @typedef {Object} CourseFilters
 * @property {string} [courseName]
 * @property {number} [duration]
 * @property {number} [minDuration]
 * @property {number} [maxDuration]
 * @property {boolean} [hasExams]
 * @property {boolean} [hasQuestions]
 * @property {number} [page] - Page number (default: 0)
 * @property {number} [size] - Page size (default: 20, min: 1, max: 100)
 * @property {string} [sortBy] - courseId, courseName, duration
 * @property {string} [sortDir] - ASC, DESC
 */

// ==================== EXAM SERVICE ====================

/**
 * @typedef {Object} ExamDTO
 * @property {number} courseId - Required
 * @property {number} duration - Required, minimum: 11
 * @property {string} title - Required
 * @property {number} numMcq - Required, minimum: 1
 * @property {number} numTf - Required, minimum: 1
 */

/**
 * @typedef {Object} ExamSubmissionDTO
 * @property {string} ssn - Required, pattern: ^\d{14}$
 * @property {number} examId - Required
 * @property {string[]} answers - Required array of answers
 */

/**
 * @typedef {Object} ExamView
 * @property {number} examId
 * @property {string} title
 * @property {string} examDate - ISO date string
 * @property {number} duration
 * @property {number} courseId
 * @property {string} courseName
 * @property {number} numMcq
 * @property {number} numTf
 * @property {QuestionView[]} questions
 */

/**
 * @typedef {Object} ExamResultResponse
 * @property {number} attemptId
 * @property {number} examId
 * @property {number} grade
 * @property {string} resultMessage
 */

/**
 * @typedef {Object} ExamFilters
 * @property {string} [title]
 * @property {number} [courseId]
 * @property {string} [examDate] - ISO date string
 * @property {string} [startDate] - ISO date string
 * @property {string} [endDate] - ISO date string
 * @property {number} [duration]
 * @property {number} [minDuration]
 * @property {number} [maxDuration]
 * @property {number} [page] - Page number (default: 0)
 * @property {number} [size] - Page size (default: 20, min: 1, max: 100)
 * @property {string} [sortBy] - examId, title, courseId, examDate, duration
 * @property {string} [sortDir] - ASC, DESC
 */

// ==================== QUESTION SERVICE ====================

/**
 * @typedef {Object} QuestionDTO
 * @property {number} courseId - Required
 * @property {string} type - Required, enum: ['MCQ', 'T/F']
 * @property {string} questionText - Required, maxLength: 500
 */

/**
 * @typedef {Object} QuestionResponse
 * @property {number} questionId
 * @property {number} courseId
 * @property {string} courseName
 * @property {string} type
 * @property {string} questionText
 * @property {ChoiceResponse[]} choices
 */

/**
 * @typedef {Object} QuestionSummary
 * @property {number} questionId
 * @property {string} type
 * @property {string} questionText
 */

/**
 * @typedef {Object} QuestionView
 * @property {number} questionId
 * @property {string} type
 * @property {string} questionText
 * @property {ChoiceView[]} choices
 */

/**
 * @typedef {Object} QuestionFilters
 * @property {number} [courseId]
 * @property {string} [type] - MCQ, T/F
 * @property {string} [questionText]
 * @property {boolean} [hasChoices]
 * @property {number} [minChoiceCount]
 * @property {number} [page] - Page number (default: 0)
 * @property {number} [size] - Page size (default: 20, min: 1, max: 100)
 * @property {string} [sortBy] - questionId, courseId, type, questionText
 * @property {string} [sortDir] - ASC, DESC
 */

// ==================== COMMON TYPES ====================

/**
 * @typedef {Object} GeneratedApiResponse
 * @property {boolean} success
 * @property {string} message
 * @property {Object} data
 * @property {string} timestamp - ISO date-time string
 */

/**
 * @typedef {Object} ApiResponse
 * @property {boolean} success
 * @property {string} message
 * @property {Object} data
 */

// Export for use in other modules
if (typeof window !== 'undefined') {
    window.TypeDefs = {
        // Student Service
        StudentDTO,
        StudentView,
        StudentProgressView,
        StudentExamHistoryView,
        StudentFilters,

        // Attempt Service
        AttemptResponse,
        AttemptView,
        AttemptFilters,

        // Choice Service
        ChoiceDTO,
        ChoiceResponse,
        ChoiceView,
        ChoiceFilters,

        // Course Service
        CourseDTO,
        CourseStatistics,
        CourseResponse,
        CourseView,
        CourseFilters,

        // Exam Service
        ExamDTO,
        ExamSubmissionDTO,
        ExamView,
        ExamResultResponse,
        ExamFilters,

        // Question Service
        QuestionDTO,
        QuestionResponse,
        QuestionSummary,
        QuestionView,
        QuestionFilters,

        // Common
        GeneratedApiResponse,
        ApiResponse
    };
}
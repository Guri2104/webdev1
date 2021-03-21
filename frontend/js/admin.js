import {
    ADD_BTN_ID,
    DELETE_BTN_ID,
    QUIZ_ANCHOR_DIV_ID,
    SAVE_BTN_ID,
} from "./constants.js";
import { Question, renderQuestionTemplate } from "./question.js";
import { Quiz } from "./quiz.js";

/**
 * Handle change in description
 * @param {Question} question
 */
function onQuestionDescriptionChange(question) {
    return (ev) => {
        question.description = ev.target.value
    };
}

/**
 * Handle change in choice
 * @param {Question} question
 * @param {number} choiceIndex
 */
function onChoiceTextChange(question, choiceIndex) {
    return (ev) => (question.choices[choiceIndex] = ev.target.value);
}

/**
 * Handle radio selection
 * @param {Question} question
 * @param {number} choiceIndex
 */
function onRadioSelect(question, choiceIndex) {
    return () => question.correctAnswerIndex = choiceIndex;
}

function getQuestionFactory() {
    return (question) => {
        return renderQuestionTemplate(
            question,
            "textarea",
            "textarea",
            onQuestionDescriptionChange,
            onChoiceTextChange,
            onRadioSelect
        );
    };
}

function loadQuiz() {
    const quiz = new Quiz(getQuestionFactory());
    quiz.loadQuestions();
    document.getElementById(QUIZ_ANCHOR_DIV_ID).appendChild(quiz.rootNode);
    return quiz;
}

/**
 * add a new question
 * @param {Quiz} quiz
 */
function addClickHandler(quiz) {
    return () => quiz.addQuestion();
}

/**
 * Save form state
 * @param {Quiz} quiz
 */
function saveClickHandler(quiz) {
    return () => quiz.saveToLocalStorage();
}

/**
 * Delete the last question
 * @param {Quiz} quiz
 */
function deleteClickHandler(quiz) {
    return () => quiz.deleteLast();
}

/**
 * Associate buttons to quiz
 * @param {Quiz} quiz
 */
function loadHandlers(quiz) {
    document.getElementById(ADD_BTN_ID).onclick = addClickHandler(quiz);
    // document.getElementById(SAVE_BTN_ID).onclick = saveClickHandler(quiz);
    // document.getElementById(DELETE_BTN_ID).onclick = deleteClickHandler(quiz);
}

function main() {
    const quiz = loadQuiz();
    loadHandlers(quiz);
}

window.onload = main;

import { Question, renderQuestionTemplate } from "./question.js";
import { Quiz } from "./quiz.js";
import { QUIZ_ANCHOR_DIV_ID, MARKS_DIV_ID, SUBMIT_BTN_ID, SHOW_DIV_CLASSNAME, HIDE_DIV_CLASSNAME, ERROR_MSG_DIV_ID, CONTROL_DIV_ID } from "./constants.js";

/**
 * Handle radio button selection.
 * @param {Question} question 
 * @param {number} choiceIndex 
 */
function onRadioSelect(question, choiceIndex) {
    return () => question.selectedIndex = choiceIndex;
}

function getQuestionFactory() {
    return (question) => {
        const questionNode = renderQuestionTemplate(
            question,
            "p",
            "span",
            null,
            null,
            onRadioSelect
        );
        return questionNode;
    };
}

function loadQuiz() {
    const quiz = new Quiz(getQuestionFactory());
    quiz.loadQuestions("student");
    document.getElementById(QUIZ_ANCHOR_DIV_ID).appendChild(quiz.rootNode);
    return quiz;
}

/**
 * Load event handlers
 * @param {Quiz} quiz 
 */
function submitHandler(quiz) {
    return () => {
        const mark = quiz.mark();
        console.log(mark);
        const submitBtn = document.getElementById(SUBMIT_BTN_ID);
        submitBtn.classList = HIDE_DIV_CLASSNAME;
        const marksDiv = document.getElementById(MARKS_DIV_ID);
        marksDiv.innerHTML = "Your total score is: " + mark;
        window.alert("Your total score is: " + mark);
    };
}

/**
 * Load event handlers
 * @param {Quiz} quiz 
 */
function loadHandlers(quiz) {
    document.getElementById(SUBMIT_BTN_ID).onclick = submitHandler(quiz);
}

function main() {
    const quiz = loadQuiz();
        loadHandlers(quiz);
}

window.onload = main;

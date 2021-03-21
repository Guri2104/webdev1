import { LOCAL_STORAGE_KEY, QUIZ_ROOT_DIV_ID } from "./constants.js";
import { Question, QuestionHTML } from "./question.js";
import { renderDiv } from "./renderHTML.js";

let initial_len = 0;

/**
 * Models a quiz
 * @param {function} questionFactory 
 */
function Quiz(questionFactory) {
    let quiz = this;
    this.questions = [];
    this.questionNodes = [];
    this.questionFactory = questionFactory;
    this.rootNode = renderDiv(QUIZ_ROOT_DIV_ID);

    this.addQuestion = () => {
        let e = document.getElementById("numberChoice");
        let numberChoices = parseInt(e.value)
        console.log(numberChoices)
        let questionId = this.questions.length === 0 ? 0 : this.questions[this.questions.length - 1].id + 1;
        const newQuestion = new Question("", 0, questionId, numberChoices);//change
        this.showQuestion(newQuestion);
        this.questions.push(newQuestion);
        // this.saveToLocalStorage();
    };

    this.removeQuestion = (questionId) => {
        let index = 0;
        while (index < this.questions.length && this.questions[i].id !== questionId) {
            index++
        }
        if (index < this.questions.length) {
            this.questions.splice(i, 1);
            this.questionNodes[i].removeFromDOM;
            this.questionNodes.splice(i, 1);
            this.saveToLocalStorage();
        }
    };

    /**
     * Show question in UI
     * @param {Question} question 
     */
    this.showQuestion = (question) => {
        const questionHTML = new QuestionHTML(question, this.rootNode, questionFactory, initial_len);
        this.questionNodes.push(questionHTML);
        questionHTML.insertIntoDOM();
    }

    this.saveToLocalStorage = () => {
        localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(this.questions));
        
    };

    /**
     * @returns {Boolean} true if there is at least 1 question else false
     */
    this.loadQuestions = (page) => { 

    // const storedQuiz = localStorage.getItem(LOCAL_STORAGE_KEY);
        let storedQuiz = null; 
        const xhttp = new XMLHttpRequest();
        const endPointRoot = "https://gurdensingh.live/webdev1/server/quiz";
        xhttp.open('GET', endPointRoot, true);
        xhttp.send();
        xhttp.onreadystatechange = () => {
            if(xhttp.readyState == 4 && xhttp.status == 200){
                console.log("received" + xhttp.responseText);
                storedQuiz = JSON.parse(xhttp.responseText)
                console.log(storedQuiz)
                if (storedQuiz === null){
                    if(page === "student"){
                        const errDiv = document.getElementById(ERROR_MSG_DIV_ID);
                        errDiv.classList = SHOW_DIV_CLASSNAME;
                        const controlDiv = document.getElementById(CONTROL_DIV_ID);
                        controlDiv.classList = HIDE_DIV_CLASSNAME;
                    }
                    return false;
                }
                this.questions = storedQuiz;
                if (this.questions.length === 0) {
                    if(page === "student"){
                        const errDiv = document.getElementById(ERROR_MSG_DIV_ID);
                        errDiv.classList = SHOW_DIV_CLASSNAME;
                        const controlDiv = document.getElementById(CONTROL_DIV_ID);
                        controlDiv.classList = HIDE_DIV_CLASSNAME;
                    }
                    return false;
                } 
                initial_len = this.questions.length
                this.questions.forEach(this.showQuestion);
                return true;
            }
            
        }
        
    }
       

    this.getQuestionCount = () => this.questions.length;

    this.mark = () => {
        let correctCount = 0;
        this.questions.forEach((question, i) => {
            if (question.correctAnswerIndex === question.selectedIndex) {
                correctCount++;
                this.questionNodes[i].markCorrect();
            } else {
                this.questionNodes[i].markIncorrect();
            }
        });
        return "" + correctCount + "/" + this.questions.length;
    }

    this.deleteLast = () => {
        this.questionNodes[this.questionNodes.length - 1].removeFromDOM();
        this.questionNodes.pop();
        this.questions.pop();
        this.saveToLocalStorage();
    }
}

export {Quiz};
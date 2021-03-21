import {
    CORRECT_CHOICE_CLASSNAME,
    INCORRECT_CHOICE_CLASSNAME,
    QUESTION_CHOICE_CLASSNAME,
    QUESTION_CHOICE_ID_PREFIX,
    QUESTION_CONTAINER_CLASSNAME,
    QUESTION_CONTAINER_ID_PREFIX,
    QUESTION_DESCRIPTION_CLASSNAME,
    QUESTION_DESCRIPTION_ID_PREFIX,
    QUESTION_HEADER_CLASSNAME,
    QUESTION_ID_PREFIX,
} from "./constants.js";
import { renderDiv, renderRadio, renderNode } from "./renderHTML.js";

const CHOICE_CONTAINER_INDEX = 2;

/**
 * Question model
 * @param {string} description
 * @param {Array<string>} choices
 * @param {number} correctAnswerIndex
 * @param {number} id
 */
function Question(description, correctAnswerIndex, id, numChoices, choices = []) {
    this.description = description;
    if(choices.length === 0)
        for(let i = 0; i < numChoices; i++)
            choices[i] = ""
    this.choices = choices;
    this.correctAnswerIndex = correctAnswerIndex;
    this.selectedIndex = -1;
    this.id = id;
}

/**
 * Question View/Controller
 * @param {Question} question
 * @param {Node} parentNode
 * @param {function(Question) : HTMLElement} renderFunc
 */
function QuestionHTML(question, parentNode, renderFunc, quizLen = 0) {
    this.question = question;
    this.node = renderFunc(question);
    this.parentNode = parentNode;
    let questionhtmlnode = this
    this.insertIntoDOM = () => {
        parentNode.appendChild(this.node);
        var addButton = document.createElement("button");
        var updateButton = document.createElement("button");
        addButton.innerHTML = "save";
        updateButton.innerHTML = "update";
        updateButton.classList.add("updatebtn");
        this.addButton = addButton;
        this.updateButton = updateButton;

        if(this.question.id < quizLen){
            parentNode.appendChild(this.updateButton)
        } else{
            parentNode.appendChild(this.addButton)
        }

        this.addButton.addEventListener ("click", function() {
            questionhtmlnode.saveQuestion("POST");
        });

        this.updateButton.addEventListener ("click", function() {
            questionhtmlnode.saveQuestion("PUT");
        });
    };

    this.removeFromDOM = () => {
        parentNode.removeChild(this.node);
    };

    this.update = () => {
        this.parentNode.replaceChild(renderFunc(question), this.node);
    };

    this.markCorrect = () => {
        const choiceDiv = getChoiceRef(this.node, this.question.selectedIndex);
        choiceDiv.classList = CORRECT_CHOICE_CLASSNAME;
    };

    this.markIncorrect = () => {
        const choiceDiv = getChoiceRef(this.node, this.question.selectedIndex);
        choiceDiv.classList = INCORRECT_CHOICE_CLASSNAME;
        const correctDiv = getChoiceRef(this.node, this.question.correctAnswerIndex);
        correctDiv.classList = CORRECT_CHOICE_CLASSNAME;
    };

    this.unMark = () => {
        this.node.childNodes[CHOICE_CONTAINER_INDEX].forEach(child => {
            child.classList = [];
        });
    };
    this.saveQuestion = (method) => {
        if(method === 'POST')
            this.parentNode.replaceChild(this.updateButton, this.addButton);   
        console.log(this.question)
        const xhttp = new XMLHttpRequest();
        const endPointRoot = "https://gurdensingh.live/webdev1/server/";
        let params = JSON.stringify(this.question);
        let put_query = "?_method=PUT";
        let resource = "quiz";
        if(method === 'PUT') resource+=put_query;
        xhttp.open('POST', endPointRoot + resource, true);
        xhttp.setRequestHeader("Content-type", "text/plain")
        // xhttp.setRequestHeader("content-length", toString(params.length));
        xhttp.send(params); 
        xhttp.onreadystatechange = () => {
            if(this.readyState == 4 && this.status == 200){
                console.log("saved!!" + this.responseText);
            }
        }
        
    };
}

/**
 * Render question choice HTML
 * @param {Question} question
 * @param {number} index
 * @param {string} text
 * @param {string} nodeType
 * @param {function(number, number)} onSelect function(questionID, choiceIndex)
 * @param {function} onTextChange
 */
function renderChoice(
    question,
    index,
    text,
    nodeType,
    onSelect = null,
    onTextChange = null
) {
    const choiceContainerNode = renderDiv(QUESTION_CHOICE_ID_PREFIX + `${question.id}_${index}`  );

    const radioNode = renderRadio(
        null,
        QUESTION_ID_PREFIX + question.id,
        index
    );
    radioNode.onclick = onSelect(question, index);
    
    // const choiceLabel = document.createTextNode(`${String.fromCharCode(97 + index)}) `);

    const choiceTextNode = renderNode(nodeType);
    if (choiceTextNode.textContent !== null) {
        choiceTextNode.textContent = text;
    }
    if (onTextChange !== null) {
        choiceTextNode.onkeypress = onTextChange(question, index);
    }

    choiceContainerNode.appendChild(radioNode);
    // choiceContainerNode.appendChild(choiceLabel)
    choiceContainerNode.appendChild(choiceTextNode);
    return choiceContainerNode;
}

/**
 * Render question HTML.
 * @param {Question} question
 * @param {string} descriptionNodeType
 * @param {string} choiceNodeType
 * @param {function(Question)} onDescriptionChange
 * @param {function(Question)} onChoiceTextChange
 * @param {function} onRadioSelect
 */
function renderQuestionTemplate(
    question,
    descriptionNodeType,
    choiceNodeType,
    onDescriptionChange = null,
    onChoiceTextChange = null,
    onRadioSelect = null
) {
    
    const container = renderDiv(
        QUESTION_CONTAINER_ID_PREFIX + question.id,
        QUESTION_CONTAINER_CLASSNAME
    );

    const header = renderNode("h2", null, QUESTION_HEADER_CLASSNAME);
    header.textContent = `Question ${question.id + 1}`;

    const descriptionNode = renderNode(
        descriptionNodeType,
        QUESTION_DESCRIPTION_ID_PREFIX + question.id,
        QUESTION_DESCRIPTION_CLASSNAME
    );

    if (descriptionNode.textContent !== null) {
        descriptionNode.textContent = question.description;
    }
    else if (descriptionNode.value) {
        descriptionNode.value = question.description;
    }
    
    if (onDescriptionChange !== null) {
        descriptionNode.onkeypress = onDescriptionChange(question);
    }

    const allChoicesContainerNode = renderDiv(null, QUESTION_CHOICE_CLASSNAME);
    question.choices.forEach((choice, i) => {
        allChoicesContainerNode.appendChild(
            renderChoice(
                question,
                i,
                choice,
                choiceNodeType,
                onRadioSelect,
                onChoiceTextChange
            )
        );
    });

    container.appendChild(header);
    container.appendChild(descriptionNode);
    container.appendChild(allChoicesContainerNode);
    return container;
}

/**
 * Get a reference to the div that represents the given choice
 * @param {Node} questionNode 
 * @param {number} choiceIndex
 * @returns {HTMLElement} 
 */
function getChoiceRef(questionNode, choiceIndex) {
    const choicesContainer = questionNode.childNodes[CHOICE_CONTAINER_INDEX];
    return choicesContainer.childNodes[choiceIndex];
}

export { Question, QuestionHTML, renderQuestionTemplate };

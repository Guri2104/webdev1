const http = require('http');
const url= require('url');
const mysql = require('mysql');

const dbCredentials  = mydbCredentials = {
    host: "localhost",
    user: "webdev_asn",//webdev_asn
    password: "bad_password",//bad_password
    database: "webdev",
    insecureAuth: true
};

const con = mysql.createConnection(dbCredentials);

con.connect(err=> { 
    if (err) throw err; 

    const createQuestionTableQuery = [ 
        'CREATE TABLE IF NOT EXISTS Questions', 
        '(id INT NOT NULL,', 
        'description VARCHAR(500),', 
        'correctAnswerIndex INT NOT NULL,',
        'PRIMARY KEY (id))'    
    ].join(' ');
    
    const createChoicesTableQuery = [ 
        'CREATE TABLE IF NOT EXISTS Choices', 
        '(ChoiceId INT NOT NULL,', 
        'QuestionId INT NOT NULL,',
        'Description VARCHAR(500),', 
        'PRIMARY KEY (ChoiceId, QuestionId),',
        'FOREIGN KEY (QuestionId) REFERENCES Questions(id))'   
    ].join(' ');
    
    con.query(createQuestionTableQuery, (err, result) => { 
        if (err) throw err; 
        console.log('Table1 created'); 
        con.query(createChoicesTableQuery, (error, res) => { 
            if (error) throw error; 
            console.log('Table2 created');     
            con.end();
        });
    }); 

    
});


function writeQuestionQuery(question) {
    return `insert into Questions(id, description, correctAnswerIndex) values (${question.id}, '${question.description}', ${question.correctAnswerIndex});`;
}

function updateQuestionQuery(question) {
    return `update Questions\nset description = '${question.description}', correctAnswerIndex=  ${question.correctAnswerIndex}\nwhere id = ${question.id};`;
}

function updateChoiceQuery(question, i) {
    return `update Choices\nset Description = '${question.choices[i]}'\nwhere QuestionId = ${question.id} and ChoiceId = ${i};`;
}

function writeChoiceQuery(question) {
    let query = "insert into Choices(ChoiceId, QuestionId, Description) values "
    let i = 0;
    question.choices.forEach(choice => {
        query += `(${i}, ${question.id}, '${choice}'),\n`
        i++;
    });
    query[query.length - 2] = ";"
    query[query.length - 1] = ""
    let str = query.substring(0, query.length - 2) + ";"
    return str;
}


function saveQuestion(question) {
    console.log("serving write request");
    const db = mysql.createConnection(dbCredentials);
    const questionQuery = writeQuestionQuery(question);
    const choiceQuery = writeChoiceQuery(question);
    db.connect(err => {

        if (err) {
            throw err;
        }


        db.query(questionQuery, (err, result) => {
            if (err) {
                throw err;
            }

            db.query(choiceQuery, (err, result) => {
                if (err) {
                    throw err;
                }
    
                db.end();
            });
        });

    });
}

function updateQuestion(question) {
    console.log("serving write request");
    const db = mysql.createConnection(dbCredentials);
    const questionQuery = updateQuestionQuery(question);
    
    db.connect(err => {

        if (err) {
            throw err;
        }


        db.query(questionQuery, (err, result) => {
            if (err) {
                throw err;
            }
            let i = 0
            question.choices.forEach(choice => {
                const choiceQuery = updateChoiceQuery(question, i);
                i++;
                db.query(choiceQuery, (err, result) => {
                    if (err) {
                        throw err;
                    }
        
                });
            })
            db.end();
        });

    });
}

function getQuestions(response) {
    console.log("Serving read request");
    const db = mysql.createConnection(dbCredentials);
    db.connect(err => {

        if (err) {
            throw err;
        }


        db.query('select * from Questions;', (err, result) => {
            if (err) {
                throw err;
            }

            console.log(typeof(result));
            let i = 0;
            let len = result.length;
            result.forEach(question => {
                
                db.query(`select * from Choices\nwhere QuestionId = ${question.id}`, (err, choices_arr) => {
                    if (err) {
                        throw err;
                    }
                    i++;
                    question.choices = [];
                    choices_arr.forEach(choice => {
                        question.choices.push(choice.Description);
                    });
                    // console.log(question);
                    if(i === len){
                        console.log("result: " + JSON.stringify(result))
                        response.writeHead(200, {
                            "Content-Type": "application/json;charset=utf-8",
                            "Access-Control-Allow-Origin": "*",
                            "Access-Control-Allow-Methods": "*"
                          });
                        response.end(JSON.stringify(result))
                    }
                });
                
            })
            console.log(result);
            db.end();
            
        });

    });
}

console.log("runned");


const server = http.createServer((req, res) => {
    if (req.method === 'GET') {
        return handleGetReq(req, res)
    } 
    else if (req.method === 'POST') {
        const q = url.parse(req.url, true);
        let method = 'POST';
        if(q.query["_method"] === 'PUT') method = 'PUT';
        return handleWritingReq(req, res, method)
    }
}).listen(4000);

function handleGetReq(req, res) {
    const { pathname } = url.parse(req.url)
    if (pathname !== '/quiz') {
        return "handleError(res, 404)"
    }
    const data = [];

    req.on('data', chunk => data.push(chunk));
    req.on('end', () => {
        getQuestions(res);
    });
    
}

function handleWritingReq(req, res, method) {

    const size = parseInt(req.headers['content-length'], 10)
    const buffer = Buffer.allocUnsafe(size)
    var pos = 0

    const { pathname } = url.parse(req.url)
    if (pathname !== '/quiz') {
        return "handleError(res, 404)"
    }

    req 
    .on('data', (chunk) => { 
      const offset = pos + chunk.length 
      if (offset > size) { 
        reject(413, 'Too Large', res) 
        return 
      } 
      chunk.copy(buffer, pos) 
      pos = offset 
    }) 
    .on('end', () => { 
      if (pos !== size) { 
        reject(400, 'Bad Request', res) 
        return 
      } 
      const data = JSON.parse(buffer.toString())
      if(method === 'POST'){
        saveQuestion(data)
      }
      else updateQuestion(data)
      
      console.log('User Posted: ', data) 
      res.writeHead(200, {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "*"
      });
      res.end('You Posted: ' + JSON.stringify(data))
    })
}
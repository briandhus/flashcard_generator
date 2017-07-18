// read/write files
var fs = require('fs');
var inquirer = require('inquirer');
var BasicCard = require('./basicCard.js');
var ClozeCard = require('./clozeCard.js');
var jsonfile = require('jsonfile');

// variables to hold basic and cloze info
var basicArray = [];
var clozeArray = [];

// var for question user is on
var question = 0;
// var for answers correct
var correct = 0;
// var for answers wrong
var incorrect = 0;


function start () {
	inquirer.prompt([
		{
			type: 'list',
			name: 'options',
			message: 'What would you like to do?',
			choices: ['Create flashcards', 'Test myself']
		}
		]).then(function(answer) {
			switch(answer.options) {
				case 'Create flashcards':
					createType();
					break;
				case 'Test myself':
					testType();
					break;
				default:
					console.log('Error, please choose again.');
					break;
			}
		})
}
//function for creating basic or cloze cards
function createType () {
	inquirer.prompt([
			{
				name: 'cardType',
				message: 'Which type of card would you like to create?',
				choices: ['Basic card', 'Cloze card'],
				type: 'list'
			}
		]).then(function(answer) {
			if(answer.cardType === 'Basic card'){
				createBasic();
			} else {
				createClozeSentence();
			}
		});	
}
//Basic card creation
function createBasic () {
	inquirer.prompt([
			{
				name: 'front',
				message: 'Front of card',
				type: 'input'
			},
			{
				name: 'back',
				message: 'Back of card',
				type: 'input'
			}
		]).then(function(answers) {
			basicCardCreate(answers.front.trim(), answers.back.trim());
		});
}
//Creates cloze sentence(front of card)
function createClozeSentence () {
	inquirer.prompt([
			{
				name: 'text',
				message: 'What is the full sentence?',
				type: 'input'
			}
		]).then(function(answer) {
			createClozeAnswer(answer.text);
		});
}
//Creates cloze answer, checks to make sure the answer is part of the cloze sentence so it can be replaced
//If answer doesn't match sentence, it will ask again for an answer until it gets a match
function createClozeAnswer (sentence) {
	var full = sentence;
	inquirer.prompt([
			{
				name: 'clozeAnswer',
				message: 'Cloze text',
				type: 'input'
			}
		]).then(function(answer) {
			var index = full.indexOf(answer.clozeAnswer.trim());
			if(index === -1) {
				console.log("This text is not part of original sentence. Try again.");
				createClozeAnswer(sentence);
			} else {
				clozeCardCreate(sentence.trim(), answer.clozeAnswer.trim());
			}
		});
}
//Takes in args for question and answer and appends the information in the form of a text object to basic file
function basicCardCreate(front, back) {
	// console.log(front, back);
	var basicCard = new BasicCard(front, back);

	basicArray.push(basicCard);

	inquirer.prompt([
			{
				name: 'newCard',
				message: 'Make another basic card?',
				type: 'confirm'
			}
		]).then(function(answer) {
			if(answer.newCard) {
				createBasic();
			} else {
				jsonfile.readFile('basicCard.json', function(err, data) {
					if(err) {
						console.log(err);
					}
					if(data.length > 0) {
						Array.prototype.push.apply(data, basicArray);
						jsonfile.writeFile('basicCard.json', data, function(err) {
							if(err) {
								console.log(err);
							}
							basicArray = [];
						});
					} else {
						jsonfile.writeFile('basicCard.json', basicArray, function(err) {
							if(err) {
								console.log(err);
							}
							basicArray = [];
						});
					}
				});
				start();
			}
		});
}
//takes in args of full question and answer part of sentence, then appends question in form of text object to cloze file 
function clozeCardCreate(full, answer) {
	//console.log(full, answer);
	var clozeCard = new ClozeCard(full, answer);

	clozeArray.push(clozeCard);

	inquirer.prompt([
		{
			name: 'newCard',
			message: 'Make another cloze card?',
			type: 'confirm'
		}
	]).then(function(answer) {
		if(answer.newCard) {
			createClozeSentence();
		} else {
			jsonfile.readFile('clozeCard.json', function(err, data) {
				if(data.length > 0) {
					Array.prototype.push.apply(data, clozeArray);
					jsonfile.writeFile('clozeCard.json', data, function(err) {
						if(err) {
							console.log(err);
						}
						clozeArray = [];
					});
				} else {
					jsonfile.writeFile('clozeCard.json', clozeArray, function(err) {
						if(err) {
							console.log(err);
						}
						clozeArray = [];
					});
				}
			});
			start();
		}
	});
}
//Choose test type
function testType (count) {
	inquirer.prompt([
			{
				name: 'testType',
				message: 'Would you like to go through basic or cloze flashcards?',
				choices: ['Cloze', 'Basic'],
				type: 'list'
			},
		]).then(function(answer) {
			if(answer.testType === 'Basic') {
				basicTest(count);
			} else {
				clozeTest(count);
			}
		});
};
//Runs basic test
function basicTest (count) {
	console.log("hello");	
	jsonfile.readFile('basicCard.json', function(err, data) {
		if (count > data.length) {
			count = data.length;
		}
		
		var correct = 0;
		var total = count;
		var testArray = data;
		var basic;

		function basicLoop() {
			if(count > 0) {			
				var num = Math.floor(Math.random() * testArray.length);
				basic = new BasicCard(testArray[num].front, testArray[num].back);
				inquirer.prompt([
						{
							name: 'response',
							message: basic.front,
							type: 'input'
						}
					]).then(function(answer) {
						if(answer.response === basic.back) {
							console.log("Correct answer!");
							console.log("====================================================");
							correct++;
						}else{
							console.log("Sorry, incorrect. The correct answer was " + basic.back);
							console.log("=====================================================");
						}
						testArray.splice(num, 1);
						count--;	
						basicLoop();
					});
			} else {
				calculateScore(correct, total);
			}
		}
		basicLoop();
	});
};
//Runs cloze deletion test
function clozeTest(count) {
	jsonfile.readFile('clozeCard.json', function(err, data) {
		if(count > data.length) {
			count = data.length;
		}

		var correct = 0;
		var total = count;
		var testArray = data;
		var cloze;

		function clozeLoop() {
			if(count > 0) {
				var num = Math.floor(Math.random() * testArray.length);
				var cloze = new ClozeCard(testArray[num].full, testArray[num].answer);
				var message = cloze.clozeSentence;
				inquirer.prompt([
						{
							name: 'response',
							message: message,
							type: 'input'
						}
					]).then(function(answer) {
						if(answer.response === cloze.answer) {
							console.log("Correct!");
							console.log(cloze.full);
							console.log("====================================");
							correct++;
						} else {
							console.log("Sorry, incorrect.");
							console.log(cloze.full);
							console.log("====================================");
						}
						testArray.splice(num, 1);
						count--;
						clozeLoop();
					});
			} else {
				calculateScore(correct, total);
			}
		}
		clozeLoop();
	});
};
//Calculates score
function calculateScore(correct, total) {
	var score = correct / total;
	console.log("You scored a " + score.toFixed(2));
	console.log("========================================");
	start();
};

start();








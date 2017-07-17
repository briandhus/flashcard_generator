// read/write files
var fs = require('fs');
var inquirer = require('inquirer');
var BasicCard = require('./basicCard.js');
var ClozeCard = require('./clozeCard.js');
var jsonFile = require('jsonfile');

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
					testNumber();
					break;
				default:
					console.log('Error, please try again.');
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
			},{
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
			createClozeAnswer(answer.full);
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
	var basicCard = new Basic(front, back);

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
	var clozeCard = new Cloze(full, answer);

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








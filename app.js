// Copyright 2016, Google, Inc.
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//   http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

// [START app]
'use strict';

process.env.DEBUG = 'actions-on-google:*';

let ActionsSdkAssistant = require('actions-on-google').ActionsSdkAssistant;
let express = require('express');
let bodyParser = require('body-parser');

let promptUserCreateIssue = require('./PromptUser/PromptUserCreateIssue.js')
let promptUserMoveIssue= require('./PromptUser/PromptUserMoveIssue.js')
let consumeInputs = require('./ConsumeInput/ConsumeInputs.js')



let app = express();
app.set('port', (process.env.PORT || 8082));
app.use(bodyParser.json({type: 'application/json'}));



function mainIntent (assistant) {
	console.log('mainIntent: '+ assistant);
	promptUserCreateIssue.askNextPrompt(assistant,{'state':'start','data':{},'function':'create'})
}

function rawInput (assistant) {
	console.log('rawInputIssueType: \'' +assistant.getRawInput()+'\'');
	let dialogueState = assistant.getDialogState();
	console.log('state: \''+ JSON.stringify(dialogueState) +'\'')
	consumeInputs.consumeInputCorrectly(assistant,assistant.getDialogState())
}

function createIntent(assistant){
	console.log('create intent')
	let issueType = assistant.getArgument('issueType');
	let summary = assistant.getArgument('summary');
	let dialogueState={'state':'start','data':{},'function':'create'}
	if(issueType){
		dialogueState.data.issueType = issueType
	}
	if(summary){
		dialogueState.data.summary = summary
	}
	console.log('issueType: \''+ JSON.stringify(issueType) +'\'')
	promptUserCreateIssue.askNextPrompt(assistant,dialogueState)
}

function moveIntent(assistant){
	console.log('create intent')
	let issueType = assistant.getArgument('issueType');
	let summary = assistant.getArgument('summary');
	let dialogueState={'state':'start','data':{},'function':'move'}
	promptUserMoveIssue.askNextPrompt(assistant,dialogueState)
}

app.post('/', function (request, response) {
	console.log('handle post');
	const assistant = new ActionsSdkAssistant({request: request, response: response});



	let actionMap = new Map();
	actionMap.set(assistant.StandardIntents.MAIN, mainIntent);
	actionMap.set('assistant.intent.create', createIntent);
	actionMap.set('assistant.intent.move', moveIntent)
	actionMap.set(assistant.StandardIntents.TEXT, rawInput);

	assistant.handleRequest(actionMap);
});

//Start the server
let server = app.listen(app.get('port'), function () {
	console.log('App listening on port %s', server.address().port);
	console.log('Press Ctrl+C to quit.');
});
//[END app]

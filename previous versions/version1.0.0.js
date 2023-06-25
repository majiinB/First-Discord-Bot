/*
*version 1.0.0
*/
// Destucture
require('dotenv').config();
const Discord = require('discord.js');

const client = new Discord.Client({
	intents: [
		Discord.GatewayIntentBits.Guilds,
		Discord.GatewayIntentBits.GuildMembers,
		Discord.GatewayIntentBits.GuildMessages,
		Discord.GatewayIntentBits.MessageContent,
	],
});

// Set variables
const activationWord = 'hey yuna';
const deactivationWord = 'bye yuna';
let isBotActive = false;

// Prompt in console to indicate the bot is online
client.on('ready', (c)=>{
  console.log(`📢 ${c.user.username} is online 📢`)
});

// Handle messages based on conditions
client.on('messageCreate', (msg)=>{
	// Trim white spaces and set message to lower case
	let message = msg.content.toLowerCase().trim();
	let parts = message.split(' ');
	let command = parts[0];


	// To check if  the one messaging is not the bot itself
	if (msg.author.bot || msg.author.username != 'majin299') {
		return;
	}
	// Check if bot is active based on the activation word
	if (isBotActive) {
		if (command === 'hello') {
			msg.reply(`Hey ${msg.author.username}!`);
		}else if(message === deactivationWord){
			isBotActive = false;
			msg.reply('Bye 😴');
		}
		else if (command === 'evaluate') {
			let expression = '';
			if (parts.length > 1) {
				expression = parts.slice(1).join(' ');
			}
			let result = evaluateExpression(expression);
		
			if (typeof result === 'number' && !isNaN(result)) {
				msg.reply('The answer to this is ' + result);
			} else {
				msg.reply(result);
			}
		}else {
			msg.reply('Sorry I can\'t understand what your\'re trying to say 😥')
		}
	} else {
		if (message === activationWord){
				isBotActive = true;
				msg.reply('Hey! What can I do for you 🤔');
		}else isBotActive = false;
	}
   
});

function evaluateExpression(expression) {
  try {
    // Use JavaScript's built-in eval() function to evaluate the expression
    const result = eval(expression);

    if (typeof result === 'number' && !isNaN(result)) {
      return result;
      // Perform additional actions if the result is a number
    } else {
      return 'Sorry I don\'t understand what you\'re saying. The correct format for this command is \'evaluate expression\', for example \'evaluate 1+1\'.';
      // Handle the case when the result is not a valid number
    }
  } catch (Error) {
    // Handle the error case and return an appropriate message
    return 'Sorry, But this is an invalid expression. Please make sure that you only use valid numbers and operation symbols.';
  }
}

//login to application or bot
client.login(process.env.TOKEN);
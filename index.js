/*
*version 1.0.3
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
client.on('messageCreate', async (msg)=>{
	// Trim white spaces and set message to lower case
	let message = msg.content.toLowerCase().trim();
	let parts = message.split(' ');
	let command = parts[0];
	let condition = searchForMention(parts);
	if (condition) {
		// To change the mention content to username
		const messageContent = msg.content;
		// Take sender, channel, and sender Id's
		const sender = msg.author.id;
		const channel = msg.channelId;
		const server = msg.guildId;
		const userId_priv ='466893830457655296';//set to always use my id
		// Fetch Id's to be used for message
		const user_priv = await client.users.fetch(userId_priv);
		const contentSender = (await client.users.fetch(sender)).username;
		const contentChannel = (await client.channels.fetch(channel)).name;
		const contentServer = (await client.guilds.fetch(server)).name;
		user_priv.send('Hey Majin you have been mentioned!\nHere are the details' + '\n**Sender:** ' + contentSender + '\n' +
		'**Server:** ' + contentServer + '\n' + '**Channel:** ' + contentChannel + '\n' + '**Message:** ' + messageContent);
	}
	// To check if  the one messaging is not the bot itself
	if (msg.author.bot || msg.author.username != 'majin299') {
		return;
	}
	// Check if bot is active based on the activation word
	if (isBotActive) {
		if (command === 'hello') {
			await msg.channel.sendTyping();
			msg.reply(`Hey ${msg.author.username}!`);
		}else if(message === deactivationWord){
			isBotActive = false;
			await msg.channel.sendTyping();
			msg.reply('Bye 😴');
		}
		else if (command === 'evaluate') {
			let expression = '';
			if (parts.length > 1) {
				expression = parts.slice(1).join(' ');
			}
			let result = evaluateExpression(expression).toFixed(2);
		
			if (typeof result === 'number' && !isNaN(result)) {
				await msg.channel.sendTyping();
				msg.reply('The answer to this is ' + result);
			} else {
				await msg.channel.sendTyping();
				msg.reply(result);
			}
		}else if(command === 'help'){
			const userId = msg.author.id;
			const user = await client.users.fetch(userId);
			user.send('Hello Since you called for help I\'m assuming you forgot my commands.\nHere are the list of my commands\n**\'hello\'**\n**\'evaluate <expression>\'**\n**\'help\'**\n**\'hey yuna\'**\n**\'bye yuna\'** ');
		}else {
			await msg.channel.sendTyping();
			msg.reply('Sorry I can\'t understand what your\'re trying to say 😥')
		}
	} else {
		if (message === activationWord){
				isBotActive = true;
				await msg.channel.sendTyping();
				msg.reply('Hey! What can I do for you 🤔');
		}else isBotActive = false;
	}
   
});
// Function used to look if the received message of bot mentions everyone or me
function searchForMention(parts) {
	let condition = false;
	for (let i = 0; i < parts.length; i++) {
		const element = parts[i];
		if (element === '@everyone' || element === '<@466893830457655296>') {
			condition = true;
		}
	}
	return condition;
}
//Function that evaluates a string mathematical expression
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
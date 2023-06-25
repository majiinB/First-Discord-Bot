/*
*version 1.0.1
*/
// Destucture
require('dotenv').config();
const Discord = require('discord.js');
const ytdl = require('ytdl-core');

const client = new Discord.Client({
	intents: [
		Discord.GatewayIntentBits.Guilds,
		Discord.GatewayIntentBits.GuildMembers,
		Discord.GatewayIntentBits.GuildMessages,
		Discord.GatewayIntentBits.MessageContent,
		Discord.GatewayIntentBits.GuildVoiceStates,
	],
});

// Set variables
const activationWord = 'hey yuna';
const deactivationWord = 'bye yuna';
const prefix = '!!';
let isBotActive = false;

const queue = new Map();

client.on('ready', (c)=>{
	console.log(`📢 ${c.user.username} is online 📢`);
})

// Handle messages based on conditions
client.on('messageCreate', async (msg)=>{
	// Trim white spaces and set message to lower case
	let message = msg.content.toLowerCase().trim();
	let parts = message.split(' ');
	let command = parts[0];
	const args = msg.content.slice(prefix.length).trim().split(/ +/);
  	const command2 = args.shift().toLowerCase();
	let serverQueue;

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
			let result = evaluateExpression(expression);
			await msg.channel.sendTyping();
			if (typeof result === 'number' && !isNaN(result)) {
				msg.reply('The answer to this is ' + result);
			} else {
				msg.reply(result);
			}
		}else if(command2 === 'play'){
			serverQueue = queue.get(msg.guild.id);
			if (!args[0]) {
				msg.channel.send('Please provide a YouTube URL or search query.');
				return;
			}
		  
			const voiceChannel = msg.member.voice.channel;
			if (!voiceChannel) {
			msg.channel.send('You must be in a voice channel to play music.');
			return;
			}
		  
			  const permissions = voiceChannel.permissionsFor(msg.client.user);
			  if (!permissions.has('CONNECT') || !permissions.has('SPEAK')) {
				msg.channel.send('I need the permissions to join and speak in your voice channel.');
				return;
			  }
		  
			  const songInfo = await ytdl.getInfo(args[0]);
			  const song = {
				title: songInfo.videoDetails.title,
				url: songInfo.videoDetails.video_url,
			  };
		  
			  if (!serverQueue) {
				// Create a new serverQueue if it doesn't exist
				const queueContract = {
				  textChannel: msg.channel,
				  voiceChannel: null, // Initialize voiceChannel as null
				  connection: null,
				  songs: [], // Make sure songs is initialized as an array
				  volume: 5,
				  playing: true,
				};
			  
				queue.set(msg.guild.id, queueContract);
				serverQueue = queueContract; // Assign the new serverQueue to the variable
			  
				//if (!voiceChannel || voiceChannel.type !== 'GUILD_VOICE') {
				  //msg.channel.send('You must be in a voice channel to play music.');
				 // return;
				//}
			  
				serverQueue.voiceChannel = voiceChannel; // Assign the voiceChannel to the serverQueue
			  
				try {
				  const connection = await voiceChannel.joinable;
				  serverQueue.connection = connection;
				} catch (error) {
				  console.error(error);
				  queue.delete(msg.guild.id);
				  msg.channel.send('There was an error while trying to join the voice channel.');
				  return;
				}
			  }
			  
			  serverQueue.songs.push(song);
			  msg.channel.send(`**${song.title}** has been added to the queue.`);
			  
			  // Call the playMusic function with the guild, song, and serverQueue
			  playMusic(msg.guild, serverQueue.songs[0], serverQueue);
		}else {
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
// Function to play music
async function playMusic(guild, song, serverQueue) {
	if (!song) {
	  serverQueue.voiceChannel.leave();
	  queue.delete(guild.id);
	  return;
	}
  
	try {
	  const dispatcher = serverQueue.connection
		.play(ytdl(song.url))
		.on('finish', () => {
		  serverQueue.songs.shift();
		  playMusic(guild, serverQueue.songs[0], serverQueue);
		})
		.on('error', (error) => console.error(error));
  
	  dispatcher.setVolumeLogarithmic(0.5); // Adjust volume if needed
	  serverQueue.textChannel.send(`Now playing: **${song.title}**`);
	} catch (error) {
	  console.error(error);
	  serverQueue.voiceChannel.leave();
	  queue.delete(guild.id);
	  serverQueue.textChannel.send('There was an error while playing the song.');
	}
  }

//login to application or bot
client.login(process.env.TOKEN);
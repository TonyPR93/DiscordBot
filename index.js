const { Client, GatewayIntentBits } = require("discord.js");
const { joinVoiceChannel, createAudioPlayer, createAudioResource, AudioPlayerStatus } = require("@discordjs/voice");
const ffmpegPath = require("ffmpeg-static").path; //Pour le son
const ytdl = require('ytdl-core'); //pour Youtube
const axios = require('axios'); //Pour fetch get/post

const config= require('./config');


const clientId = config.clientId;
const clientSecret = config.clientSecret;
const regions = ['us', 'eu', 'kr', 'tw']; // Remplacez par la région appropriée

const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent,
        GatewayIntentBits.GuildVoiceStates,
        GatewayIntentBits.GuildMembers,
        GatewayIntentBits.GuildMessageReactions

    ]
});

const audioPlayer = createAudioPlayer();

client.on("ready", () => {
    const guildId = config.guildId; // ID Serveur
    const channelId = config.channelId; // ID Salon général

    const guild = client.guilds.cache.get(guildId);
    if (guild) {
        const channel = guild.channels.cache.get(channelId);
        if (channel) {
            channel.send("Exo bot discord");
            channel.send("Command : ping, mention, !link, play [YouTube URL], playMP3, playHymne, !serverinfo, PriceToken");
        } else {
            console.log(`Impossible de trouver le canal général avec l'ID ${channelId}`);
            console.log(channel);
        }
    } else {
        console.log(`Impossible de trouver le serveur avec l'ID ${guildId}`);
    }
});

client.on("messageCreate", async message =>{
    let msgcnt = message.content.split(/\s+/);
    const guildId = config.guildId; // ID Serveur
    const channelId = config.channelId; // ID Salon général
    const guild = client.guilds.cache.get(guildId);
    const channel = guild.channels.cache.get(channelId);
    //console.log(msgcnt);
    //console.log(msgcnt[0]);
    //console.log('ok');
    if(message.author.bot) return;
    //console.log(message);
    if(message.content === "ping"){
                // Réagissez au message avec les emojis '✅' et '❌'
                //message.react('✅');
                //message.react('❌');
        

    }
    else if(message.content === "mention"){
        message.reply("Mention d'utilisateur : <@" + message.author.id + "> \n Mention d'un salon : <#" + message.channel.id + ">");
    }
    else if(msgcnt[0] === "!link"){

        //const botInfo = new MessageEmbed().setDescription('[Votre lien!](https://www.google.be)')
        
        message.channel.send('https://worldofwarcraft.com/fr-fr/character/eu/'+ msgcnt[1] +"/"+msgcnt[2]);        
        /*Maniere 2 (pas ok)
        message.channel.send({
            embed: {
               title: 'Your message',
               url: 'Some URL',
            },
         });*/

        /*Manière une (pas ok)
        const txtlink = "Voici votre lien";
        const msglink= Formatters.hyperlink("", "www.google.be", txtlink);
        message.reply(msglink);*/
    }



    else if (message.content === "!serverinfo") {
        const createdDate = message.guild.createdAt;
        const serverName = message.guild.name;
        const memberCount = message.guild.memberCount;
        const serverInfo = `Nom du serveur : ${serverName}\nCréée le : ${createdDate.getDate()} ${createdDate.getMonth()} ${createdDate.getFullYear()}\nNombre de membres : ${memberCount}`;
        message.channel.send(serverInfo);
        console.log(message.guild)
    }
    else if (msgcnt[0] === "playMP3") {
        if (!message.member.voice.channel) {
            return message.reply("Veuillez rejoindre un canal vocal avant de jouer de la musique.");
        }

        const musicURL = msgcnt[1];

        const voiceChannel = message.member.voice.channel;
        const connection = joinVoiceChannel({
            channelId: voiceChannel.id,
            guildId: voiceChannel.guild.id,
            adapterCreator: voiceChannel.guild.voiceAdapterCreator,
            ffmpegPath: ffmpegPath
        });

        const mp3File = 'axe.mp3';

    // Crée une ressource audio à partir du fichier MP3 local
    const audioResource = createAudioResource(mp3File);

    // Joue la musique dans le canal vocal
    audioPlayer.play(audioResource);
    connection.subscribe(audioPlayer);

    message.reply('La musique est en train de jouer !');
  }
    
  else if (msgcnt[0] === "playHymne") {
    if (!message.member.voice.channel) {
        return message.reply("Veuillez rejoindre un canal vocal avant de jouer de la musique.");
    }

    const musicURL = "INSEREZ LIEN YOUTUBE RANDOM";

    const voiceChannel = message.member.voice.channel;
    const connection = joinVoiceChannel({
        channelId: voiceChannel.id,
        guildId: voiceChannel.guild.id,
        adapterCreator: voiceChannel.guild.voiceAdapterCreator,
        ffmpegPath: ffmpegPath
    });
    const stream = ytdl(musicURL, { filter: 'audioonly' });
    const audioResource = createAudioResource(stream);
    audioResource.volume=1;
    console.log(audioResource);
    audioPlayer.play(audioResource);
    connection.subscribe(audioPlayer);

    message.reply("La musique est en train de jouer !");
}
    else if (msgcnt[0] === "play") {
        if (!message.member.voice.channel) {
            return message.reply("Veuillez rejoindre un canal vocal avant de jouer de la musique.");
        }

        const musicURL = msgcnt[1];

        const voiceChannel = message.member.voice.channel;
        const connection = joinVoiceChannel({
            channelId: voiceChannel.id,
            guildId: voiceChannel.guild.id,
            adapterCreator: voiceChannel.guild.voiceAdapterCreator,
            ffmpegPath: ffmpegPath
        });
        const stream = ytdl(musicURL, { filter: 'audioonly' });
        const audioResource = createAudioResource(stream);
        audioResource.volume=1;
        console.log(audioResource);
        audioPlayer.play(audioResource);
        connection.subscribe(audioPlayer);

        message.reply("La musique est en train de jouer !");
    } else if (message.content === "stop") {
        audioPlayer.stop();
        message.reply("La musique a été arrêtée.");
    } 
    
    else if (message.content === "search") {
        const query = msgcnt[1]; // Rassemble tous les arguments pour former la requête de recherche
    
        // Effectue une requête vers l'API de recherche (ici, nous utilisons l'API de recherche de Google comme exemple)
        const searchResults = await performSearch(query);
        console.lof(searchResults);
        // Traite les résultats de la recherche
        if (searchResults) {
            // Affiche les résultats dans le canal de discussion
            searchResults.forEach(result => {
                message.channel.send(`- ${result.title}: ${result.link}`);
            });
        } else {
            message.channel.send("Aucun résultat trouvé pour la recherche spécifiée.");
        }
    } 

    else if (message.content === "PriceToken") {
        const playerName = msgcnt[1] // Récupère le nom du joueur à partir de la commande
    
       try {
      const tokenPrices = [];

      for (const region of regions) {
        // Obtenez le jeton d'accès pour la région actuelle
        const tokenResponse = await axios.post(`https://oauth.battle.net/token`, null, {
          auth: {
            username: clientId,
            password: clientSecret
          },
          params: {
            grant_type: 'client_credentials'
          }
        });

        const accessToken = tokenResponse.data.access_token;

        // Déterminez l'URL en fonction de la région
        let apiUrl;
        if (region === 'cn') {
          apiUrl = 'https://gateway.battlenet.com.cn/data/wow/token/';
        } else {
          apiUrl = `https://${region}.api.blizzard.com/data/wow/token/?namespace=dynamic-${region}`;
        }

        // Utilisez le jeton d'accès pour effectuer la requête de prix de token pour la région actuelle
        const tokenPriceResponse = await axios.get(apiUrl, {
          headers: {
            Authorization: `Bearer ${accessToken}`
          }
        });

        const tokenPrice = tokenPriceResponse.data.price;
        console.log(tokenPrice)
        tokenPrices.push({ region, price: tokenPrice });
        console.log(tokenPrices)
      }

      // Affiche les prix des tokens pour chaque région
      const responseMessage = tokenPrices.map(tp => `Prix du WoW Token en ${tp.region.toUpperCase()} : ${tp.price/10000} pièces d'or.`).join('\n');
      message.channel.send(responseMessage + " \n");
    } catch (error) {
      console.error(error);
      message.channel.send('Une erreur s\'est produite lors de la récupération des prix des WoW Tokens.');
    }
      }
    


      else if (message.content === "MonPerso") {
    
        try {
            // Obtenez le jeton d'accès
            const tokenResponse = await axios.post(`https://oauth.battle.net/token`, null, {
              auth: {
                username: clientId,
                password: clientSecret
              },
              params: {
                grant_type: 'client_credentials'
              }
            });
      
            const accessToken = tokenResponse.data.access_token;
      
            // Utilisez le jeton d'accès pour effectuer la requête
            const infoResponseToken = await axios.get(`https://eu.api.blizzard.com/profile/wow/character/archimonde/knuto/achievements?namespace=profile-eu&locale=fr_FR`, {
              headers: {
                Authorization: `Bearer ${accessToken}`
              }
            });
      
            const tokenInfo = infoResponseToken.data;

            const nameChar = tokenInfo.character.name;
            const totAch = tokenInfo.total_quantity;
            const totPoint = tokenInfo.total_points;
            
            message.channel.send(`${nameChar} : à accompli ${totAch} haut fait, ce qui lui donne ${totPoint} points`);
            console.log(tokenInfo)
          } catch (error) {
      console.error(error);
      message.channel.send(`Le personnage est introuvable : ${error.MessageContent}`);
    }
      }




});





audioPlayer.on('stateChange', (oldState, newState) => {
    console.log(`L'état du lecteur audio a changé de "${oldState.status}" à "${newState.status}"`);
    const channelId = config.channelId;
    const channel = client.channels.cache.get(channelId);
    // Exemple d'actions en fonction de l'état du lecteur audio
    if (newState.status === 'playing') {
        channel.send('AudioPlayer On');
    } else if (newState.status === 'paused') {
      console.log('La musique est en pause');
    } else if (newState.status === 'idle') {
        channel.send('AudioPlayer off');
    }
});

client.on('guildMemberAdd', async (member) => {
    const guild = member.guild;
    const channel = guild.channels.cache.get(config.charteId);
  
    if (!channel) {
      console.error(`Impossible de trouver le canal avec l'ID ${config.charteId}`);
      return;
    }
  
    const charterMessage = await channel.send('Voici la charte du serveur. Veuillez l\'accepter en réagissant avec ✅ pour continuer ou avec ❌ pour refuser.');
  
    await charterMessage.react('✅');
    await charterMessage.react('❌');
    const filter = (reaction, user) => {
      return ['✅', '❌'].includes(reaction.emoji.name) && user.id === member.user.id;
    };
  
    const collector = charterMessage.createReactionCollector(filter, { max: 1, time: 10000 });
  
    collector.on('collect', (reaction, user) => {
      console.log('Réaction:', reaction.emoji.name, user.id);
      if (reaction.emoji.name === '✅') {
        console.log('ok');
      } else if (reaction.emoji.name === '❌') {
        console.log('pas ok');
      }
    });
  
    collector.on('end', (collected) => {
      if (collected.size === 0) {
        console.log(`Aucune réaction collectée pour la charte du serveur.`);
      }
    });
  });


//   // Événement déclenché lorsqu'une réaction est ajoutée à un message
// client.on('messageReactionAdd', (reaction, user) => {
//     // Vérifiez si l'utilisateur est un bot (y compris votre propre bot) pour éviter les boucles
//     if (user.bot) return;

//     // Vérifiez si la réaction a été ajoutée à un message commençant par "!ping"
//     if (reaction.message.content.startsWith('ping')) {
//         // Vérifiez quel emoji a été réagi
//         if (reaction.emoji.name === '✅') {
//             console.log('Emoji ✅ réagi');
//         } else if (reaction.emoji.name === '❌') {
//             console.log('Emoji ❌ réagi');
//         }
//     }
// });
client.login(config.tokenBotDiscord);
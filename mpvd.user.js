// ==UserScript==
// @name         MPP via Discord
// @namespace    http://tampermonkey.net/
// @version      1.0
// @description  A crazy experiment of using _Discord_ as a backend for Multiplayer Piano
// @author       Lamp
// @homepage     https://github.com/ledlamp/MPP-via-Discord
// @match        http://www.multiplayerpiano.com/MPP-via-Discord
// @grant        none
// @require      https://raw.githubusercontent.com/discordjs/discord.js/webpack/discord.11.4.2.min.js
// ==/UserScript==

window.client = new Discord.Client({fetchAllMembers: true});
client.login("PASTE_TOKEN_HERE");

client.once("ready", function(){
	var dataGuild = client.guilds.get("569660009663823922");
	var dataChannels = dataGuild.channels.filter(c => c.name == "data").sort((a,b) => a.id - b.id).array();
	console.log(dataChannels);
	if (!dataChannels.length) {alert("Error: Did not get any channels"); location.reload(); return;}
	var i = 0;
	MPP.client.stop();
	setTimeout(()=>{
		
		// set up the room
		function updateRoom() {
			var ppl = dataGuild.members.filter(member => member.presence.status != "offline").map(member => ({
				id: member.id,
				_id: member.id,
				name: member.displayName,
				color: `#${Number(member.id).toString(16).slice(5, -4)}`
			}));
			MPP.client.emit("ch", {
				ch: {
					_id: "MPP via Discord",
					settings: {lobby: true, visible: true, chat: true, crownsolo: false, color: "#2C2F33"}
				},
				p: client.user.id,
				ppl
			});
			MPP.client.setParticipants(ppl);
			ppl.forEach(p => MPP.client.emit("participant update", MPP.client.findParticipantById(p.id))); // needed for name changes
		}
		updateRoom();
		
		// make MPP send data to discord
		MPP.client.send = function(data) {
			//if (data.startsWith('[{"m":"m","x":"')) return;
			console.log("%c⬆︎ " + data, "color: green;");
			dataChannels[i++ % dataChannels.length].send(data).catch(error => client.emit("error", error));
		}
				
		// set up note sending
		MPP.client.isConnected = () => true;
		MPP.client.connectionTime = Date.now();
		MPP.client.noteBuffer = [];
		MPP.client.noteBufferTime = 0;
		MPP.client.noteFlushInterval = setInterval(function() {
			if(MPP.client.noteBufferTime && MPP.client.noteBuffer.length > 0) {
				MPP.client.sendArray([{m: "n", t: MPP.client.noteBufferTime + 1000, n: MPP.client.noteBuffer, p: client.user.id}]);
				MPP.client.noteBufferTime = 0;
				MPP.client.noteBuffer = [];
			}
		}, 200);
		
		// set up chat sending
		MPP.chat.send = function(message) {
			MPP.client.sendArray([{m:"a", a: message, t: Date.now(), p: Object.fromEntries(Object.entries(MPP.client.getOwnParticipant()).filter(x=>["id","name","color","_id"].includes(x[0])))}]);
		};
		
		// handle userset
		MPP.client.on("userset", msg => {
			dataGuild.me.setNickname(msg.set.name);
		});
		
		// handle member updates
		client.on("guildMemberUpdate", (oldMember, member) => {
			if (member.guild.id != dataGuild.id) return;
			updateRoom();
		});
		// handle status updates
		client.on("presenceUpdate", (oldMember, member) => {
			if (member.guild.id != dataGuild.id) return;
			updateRoom();
		});
		
		// handle mice
		MPP.client.on("m", msg => {
			if(MPP.client.ppl.hasOwnProperty(msg.id)) {
				MPP.client.participantUpdate(msg);
			}
		});
		// fix mice
		MPP.client.sendArray = function(arr) {
			arr.forEach(msg => {
				if (msg.m == 'm') msg.id = client.user.id;
			});
			MPP.client.send(JSON.stringify(arr));
		};
		
		// see own cursor
		(function(){
			var part = MPP.client.getOwnParticipant();
			var div = document.createElement("div");
			div.className = "cursor";
			div.style.display = "none";
			part.cursorDiv = $("#cursors")[0].appendChild(div);
			$(part.cursorDiv).fadeIn(2000);
			var div = document.createElement("div");
			div.className = "name";
			div.style.backgroundColor = part.color || "#777"
			div.textContent = part.name || "";
			part.cursorDiv.appendChild(div);
		})();
		
	}, 1000);
});

// receive data from discord
client.on("message", message => {
	if (message.guild.id == "569660009663823922" && message.channel.name == "data") {
		console.log("%c⬇︎ " + message.content, "color: red;");
		var arr = JSON.parse(message.content);
		arr.forEach(msg => {
			if (msg.m == "n" && msg.p == client.user.id) return; // ignore own notes
			MPP.client.emit(msg.m, msg);
		});
	}
});

// show errors in chat
client.on("warn", error => {
	console.warn(error);
	MPP.chat.receive({a: error.message, p:{name: error.name, color: "orange"}});
});
client.on("error", error => {
	console.error(error);
	MPP.chat.receive({a: error.message, p:{name: error.name, color: "red"}});
});

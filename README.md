# MPP via Discord
A crazy experiment of using _Discord_ as a backend for Multiplayer Piano. Using a Discord client, MPP's JSON data is sent to and received from a Discord server across multiple channels. Participants are based on members online. Supports notes, cursors, chat, and name changes.

## Instructions
1. Install [Tampermonkey](https://tampermonkey.net) if you don't already have a userscript manager.
2. Install the [userscript](mpvd.user.js).
3. Join the [Discord server](https://discord.gg/kNEEdaZ).
4. On your [Developer Portal](https://discordapp.com/developers/applications/me), create an app with a bot user.
5. Invite it to the Discord server by generating an OAuth2 URL with the 'bot' scope and pasting it into your browser.
6. Navigate to http://www.multiplayerpiano.com/mpp-via-discord and the script should activate.
7. Paste the bot's token when prompted. This token will be stored in localStorage.token. You can change it with the local storage inspector of your developer tools.

## Screenshot
![Screenshot](https://i.imgur.com/UuZ1aN6.png)

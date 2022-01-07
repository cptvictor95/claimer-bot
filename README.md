# Spot Claimer Bot

This is a discord bot created for organizational purposes on Mir4's Magic Square and Secret Peak spots. A user is able to claim a specific spot for leveling or resource farming for a pre-determined/limited amount of time based on the maximum number of tickets.

## Bot Commands

- /ping
  -- This command is used for testing, if everything is running correct, you should receive a message `Pong` indicating
  that the bot receives and send infos.

- /server
  -- Shows what server you are in, and how many users is on the same discord server

- /user
  -- Shows user infos like `Id` and `Tagname`

- /help
  -- Shows the command list with all descriptions.

- /queue
  -- Shows the queue and all the users in it.

- /peak
  -- Puts you in the queue. Select what floor and spot you want to queue for.

- /square
  -- Puts you in the queue. Select what floor and chamber you want to queue for.

- /leave
  -- Leaves the queue you are in.

## Usage instructions

Create a .env file with the following vars

```
NODE_ENV=dev

CLIENT_ID=asd123

PROD_GUILD_ID=asd123
DEV_GUILD_ID=asd123

TOKEN=asd123
```

## Scripts

Run `yarn deploy` or `npm run deploy` - To deploy the commands created inside the `/commands` folder.

Run `yarn dev` or `npm run dev` - To run the development server on your local machine.

### Invitation link format

`https://discord.com/api/oauth2/authorize?client_id=123456789012345678&permissions=0&scope=bot%20applications.commands`

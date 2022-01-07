# Claimer Bot

This is a discord bot created for organizational purposes on Mir4's Magic Square and Secret Peak spots. A user is able to claim a specific spot for leveling or resource farming for a pre-determined/limited amount of time based on the maximum number of tickets.
Este é um bot de discord criado para organizar as instâncias Praça Mágica e Pico Desconhecido do Mir4. Em que usuários podem reivindicar salas e locais de up ou farm, determinados conforme as regras da guilda.

## Bot Commands / Comandos do Bot

- /ping
  -- Returns a message `Pong` indicating that the bot is able to receive commands.
  -- Retorna a mensagem `Pong` indicando que o bot está pronto para receber comandos.

- /server
  -- Shows what server you are in, and how many users is on the same discord server.
  -- Mostra o servidor que você está, e quantos membros estão nesse servidor.

- /user
  -- Shows user infos like `Id` and `Tagname`.
  -- Mostra informações do usuário como `Id` e `Tagname`.

- /help
  -- Shows the command list with all descriptions.
  -- Mostra a lista de comandos e suas descrições.

- /praca
  -- Puts you in the queue. Select what floor and chamber you want to queue for.
  -- Coloca você na fila da Praça Mágica. Selecione o andar e a sala que você deseja dar claim.

- /filapraca
  -- Shows the Magic Square queue and all the players in it.
  -- Mostra a fila de todos os jogadores na Praça Mágica.

- /pico
  -- Puts you in the queue. Select what floor and spot you want to queue for.
  -- Coloca você na fila do Pico Desconhecido. Selecione o andar e o spot que você deseja dar claim.
  
- /filapico
  -- Shows the Secret Peak queue and all the players in it.
  -- Mostra a fila de todos os jogadores no Pico Desconhecido.

- /leave
  -- Leaves the queue you are in.
  -- Sai da fila que você está.

## Usage instructions / Instruções de uso

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

### Invitation link format for servers / Formato de link de convite do Bot para os servidores

`https://discord.com/api/oauth2/authorize?client_id=123456789012345678&permissions=0&scope=bot%20applications.commands`

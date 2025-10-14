// index.js
import express from 'express';
import { Client, GatewayIntentBits } from 'discord.js';
import 'dotenv/config';

// ===================== EXPRESS SERVER =====================
const app = express();
const PORT = process.env.PORT || 8000;

app.get('/', (req, res) => {
  res.send('✅ Bot is running!');
});

app.listen(PORT, () => {
  console.log(`Express server listening on port ${PORT}`);
});

// ===================== DISCORD BOT =====================
const client = new Client({ intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages] });

client.once('ready', () => {
  console.log(`✅ Бот ${client.user.tag} запущен!`);
});

// Логин через токен из Koyeb Secret
const token = process.env.DISCORD_TOKEN;

if (!token) {
  console.error('❌ DISCORD_TOKEN не найден!');
  process.exit(1);
}

client.login(token).catch(err => {
  console.error('❌ Ошибка при логине бота:', err);
  process.exit(1);
});

// ===================== ОБРАБОТКА КОМАНД =====================
// Пример простой команды: если нужно подключить команды из папки, можно дописать здесь
// import fs from 'fs';
// import path from 'path';
// client.commands = new Map();
// const commandsPath = path.join(process.cwd(), 'commands');
// const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith('.js'));
// for (const file of commandFiles) {
//     const command = await import(`./commands/${file}`);
//     if (command.data?.name) client.commands.set(command.data.name, command);
// }

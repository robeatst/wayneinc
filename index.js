import 'dotenv/config';
import { Client, GatewayIntentBits, Collection, Events } from 'discord.js';
import fs from 'fs';
import path from 'path';
import express from 'express';

const app = express();
const PORT = 8000;

// --- Express сервер, чтобы Koyeb не падал на health check ---
app.get('/', (req, res) => res.send('Bot is running!'));
app.listen(PORT, () => console.log(`✅ Express server listening on port ${PORT}`));

// --- Discord клиент ---
const client = new Client({
  intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages, GatewayIntentBits.MessageContent]
});

client.commands = new Collection();
const prefix = '!'; // твой префикс

// --- Загружаем команды ---
const commandsPath = path.join(process.cwd(), 'commands');
const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith('.js'));

for (const file of commandFiles) {
  const filePath = path.join(commandsPath, file);
  const command = await import(`file://${filePath}`);
  if (command && command.execute && command.data?.name) {
    client.commands.set(command.data.name, command);
  }
}

// --- Событие готовности ---
client.once(Events.ClientReady, c => {
  console.log(`✅ Бот ${c.user.tag} запущен!`);
});

// --- Обработка сообщений ---
client.on(Events.MessageCreate, async message => {
  if (!message.content.startsWith(prefix) || message.author.bot) return;

  const args = message.content.slice(prefix.length).trim().split(/ +/);
  const commandName = args.shift().toLowerCase();

  const command = client.commands.get(commandName);
  if (!command) return;

  try {
    await command.execute(message, args);
  } catch (error) {
    console.error('Ошибка команды:', error);
    message.reply('Произошла ошибка при выполнении команды.');
  }
});

// --- Логин бота ---
client.login(process.env.DISCORD_TOKEN).catch(console.error);

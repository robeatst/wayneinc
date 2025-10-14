// Загружаем переменные окружения из .env
import 'dotenv/config';
import express from 'express';
import { Client, GatewayIntentBits } from 'discord.js';

// --- Express ---
const app = express();
const port = process.env.PORT || 8000;

app.get('/', (req, res) => {
  res.send('Bot is running!');
});

app.listen(port, () => {
  console.log(`✅ Express server listening on port ${port}`);
});

// --- Discord Bot ---
const client = new Client({
  intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages, GatewayIntentBits.MessageContent],
});

client.once('clientReady', () => {
  console.log(`✅ Бот ${client.user.tag} запущен!`);
});

// Логин бота через токен из Environment Variable
const token = process.env.DISCORD_TOKEN;

if (!token) {
  console.error('❌ DISCORD_TOKEN не найден');
  process.exit(1);
}

client.login(token).catch(err => {
  console.error('Ошибка логина бота:', err);
  process.exit(1);
});

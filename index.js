import 'dotenv/config';
import { 
  Client, 
  GatewayIntentBits, 
  Collection, 
  Events, 
  SlashCommandBuilder,
  ActionRowBuilder,
  StringSelectMenuBuilder,
  ModalBuilder,
  TextInputBuilder,
  TextInputStyle
} from 'discord.js';
import fs from 'fs';
import path from 'path';
import express from 'express';

// ==== EXPRESS для Koyeb health check ====
const app = express();
const PORT = process.env.PORT || 8000;
app.get('/', (_, res) => res.send('Bot is running!'));
app.listen(PORT, () => console.log(`✅ Express server listening on port ${PORT}`));

// ==== DISCORD BOT ====
const client = new Client({ intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages, GatewayIntentBits.MessageContent] });

// ==== COLLECTION ДЛЯ КОМАНД ====
client.commands = new Collection();

// ==== Словарь каналов по типу контракта ====
const channelsMap = {
  'Дары моря': '1427776962390261801',
  'Металлургия': '1427776981432406117',
  'Товары со склада': '1427777104879288550',
  'Ателье': '1427777125519458384'
};

// ==== Загрузка команд из папки commands ====
const commandsPath = path.join(process.cwd(), 'commands');
const commandFiles = fs.readdirSync(commandsPath).filter(f => f.endsWith('.js'));

for (const file of commandFiles) {
  const { data, execute } = await import(`./commands/${file}`);
  client.commands.set(data.name, execute);
}

// ==== READY ====
client.once(Events.ClientReady, () => {
  console.log(`✅ Бот ${client.user.tag} запущен!`);
});

// ==== ОБРАБОТКА СООБЩЕНИЙ ! ====
client.on(Events.MessageCreate, async message => {
  if (message.author.bot) return;
  if (!message.content.startsWith('!')) return;

  const args = message.content.slice(1).trim().split(/ +/);
  const commandName = args.shift().toLowerCase();

  const command = client.commands.get(commandName);
  if (!command) return;

  try {
    await command(message, args);
  } catch (err) {
    console.error(err);
    await message.reply('Ошибка при выполнении команды.');
  }
});

// ==== ОБРАБОТКА INTERACTIONS (Slash, SelectMenu, Modal) ====
client.on(Events.InteractionCreate, async interaction => {

  // ---------------- SLASH /contracts ----------------
  if (interaction.isChatInputCommand() && interaction.commandName === 'contracts') {
    const row = new ActionRowBuilder().addComponents(
      new StringSelectMenuBuilder()
        .setCustomId('select_contract_type')
        .setPlaceholder('Выберите тип контракта')
        .addOptions(Object.keys(channelsMap).map(key => ({ label: key, value: key })))
    );
    await interaction.reply({ content: 'Выберите тип контракта:', components: [row], ephemeral: true });
  }

  // ---------------- SELECT MENU ----------------
  if (interaction.isStringSelectMenu() && interaction.customId === 'select_contract_type') {
    const selectedType = interaction.values[0];

    const modal = new ModalBuilder()
      .setCustomId(`contract_modal_${selectedType}`)
      .setTitle(`Контракт: ${selectedType}`);

    const screenshotInput = new TextInputBuilder()
      .setCustomId('screenshot')
      .setLabel('Ссылка на скриншот')
      .setStyle(TextInputStyle.Short)
      .setRequired(true);

    const activatedInput = new TextInputBuilder()
      .setCustomId('activated')
      .setLabel('Активировал контракт? (Да/Нет)')
      .setStyle(TextInputStyle.Short)
      .setRequired(true);

    modal.addComponents(
      new ActionRowBuilder().addComponents(screenshotInput),
      new ActionRowBuilder().addComponents(activatedInput)
    );

    await interaction.showModal(modal);
  }

  // ---------------- MODAL SUBMIT ----------------
  if (interaction.isModalSubmit() && interaction.customId.startsWith('contract_modal_')) {
    const contractType = interaction.customId.replace('contract_modal_', '');
    const screenshot = interaction.fields.getTextInputValue('screenshot');
    const activated = interaction.fields.getTextInputValue('activated');

    const channelId = channelsMap[contractType];
    if (!channelId) {
      await interaction.reply({ content: 'Ошибка: неизвестный тип контракта.', ephemeral: true });
      return;
    }

    const channel = await client.channels.fetch(channelId);

    await channel.send(
      `**${interaction.user}**\n` +
      `Тип контракта: ${contractType}\n` +
      `Скриншот: ${screenshot}\n` +
      `${activated.toLowerCase() === 'да' ? 'Активировал контракт ✅' : 'Не активировал контракт ❌'}`
    );

    await interaction.reply({ content: 'Контракт успешно отправлен!', ephemeral: true });
  }

});

client.login(process.env.DISCORD_TOKEN);

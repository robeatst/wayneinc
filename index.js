import 'dotenv/config';
import { Client, GatewayIntentBits, Collection, Events, ModalBuilder, TextInputBuilder, TextInputStyle, ActionRowBuilder, ButtonBuilder, ButtonStyle } from 'discord.js';
import fs from 'fs';
import path from 'path';

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent
  ]
});

client.commands = new Collection();

// Загружаем команды из папки commands
const commandsPath = path.join(process.cwd(), 'commands');
const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith('.js'));

for (const file of commandFiles) {
  const { data, execute } = await import(`./commands/${file}`);
  client.commands.set(data.name, execute);
}

// Логин
client.once('clientReady', () => {
  console.log(`✅ Бот ${client.user.tag} запущен!`);
});

// Обработка текстовых команд с "!"
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

// Обработка кнопок и модальных окон
client.on(Events.InteractionCreate, async interaction => {
  // Кнопка "ОТПРАВИТЬ"
  if (interaction.isButton() && interaction.customId === 'open_modal') {
    const modal = new ModalBuilder()
      .setCustomId('contract_modal')
      .setTitle('Отправка контракта');

    const typeInput = new TextInputBuilder()
      .setCustomId('contractType')
      .setLabel('Тип контракта (Дары моря, Металлургия, Товары со склада, Ателье)')
      .setStyle(TextInputStyle.Short)
      .setRequired(true);

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
      new ActionRowBuilder().addComponents(typeInput),
      new ActionRowBuilder().addComponents(screenshotInput),
      new ActionRowBuilder().addComponents(activatedInput)
    );

    await interaction.showModal(modal);
    return;
  }

  // Модальное окно
  if (interaction.isModalSubmit() && interaction.customId === 'contract_modal') {
    const contractType = interaction.fields.getTextInputValue('contractType');
    const screenshot = interaction.fields.getTextInputValue('screenshot');
    const activated = interaction.fields.getTextInputValue('activated');

    // Каналы по типам контрактов
    const channelIds = {
      'Дары моря': '1427776962390261801',
      'Металлургия': '1427776981432406117',
      'Товары со склада': '1427777104879288550',
      'Ателье': '1427777125519458384'
    };

    const channelId = channelIds[contractType];
    if (!channelId) {
      await interaction.reply({ content: 'Ошибка: неизвестный тип контракта.', ephemeral: true });
      return;
    }

    const channel = await client.channels.fetch(channelId);

    await channel.send(`**${interaction.user}**\nСкриншот: ${screenshot}\n${activated === 'Да' ? 'Активировал контракт ✅' : 'Не активировал контракт ❌'}`);

    await interaction.reply({ content: 'Контракт успешно отправлен!', ephemeral: true });
  }
});

client.login(process.env.DISCORD_TOKEN);

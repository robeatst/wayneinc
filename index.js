import 'dotenv/config';
import { Client, GatewayIntentBits, Collection, Events, ModalBuilder, TextInputBuilder, TextInputStyle, ActionRowBuilder, ButtonBuilder, ButtonStyle, StringSelectMenuBuilder } from 'discord.js';

const client = new Client({ intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages] });
client.commands = new Collection();

// Команды
import { data as submitData, execute as submitExecute } from './commands/submit.js';
client.commands.set(submitData.name, submitExecute);

client.once('clientReady', () => {
  console.log(`✅ Бот ${client.user.tag} запущен!`);
});

// Слушаем команды
client.on(Events.InteractionCreate, async interaction => {
  if (interaction.isChatInputCommand()) {
    const command = client.commands.get(interaction.commandName);
    if (!command) return;
    try {
      await command(interaction);
    } catch (err) {
      console.error(err);
      await interaction.reply({ content: 'Ошибка при выполнении команды', ephemeral: true });
    }
  }

  // Обработка модальных окон
  if (interaction.isModalSubmit()) {
    const contractType = interaction.fields.getTextInputValue('contractType');
    const screenshot = interaction.fields.getTextInputValue('screenshot');
    const activated = interaction.fields.getTextInputValue('activated');

    // Сопоставление типа контракта с каналом
    const channelIds = {
      'Дары моря': '1427776962390261801',
      'Металлургия': '1427776981432406117',
      'Товары со склада': '1427777104879288550',
      'Ателье': '1427777125519458384'
    };

    const channelId = channelIds[contractType];
    const channel = await client.channels.fetch(channelId);

    await channel.send(`**${interaction.user}**\nСкриншот: ${screenshot}\n${activated === 'Да' ? 'Активировал контракт ✅' : 'Не активировал контракт ❌'}`);

    await interaction.reply({ content: 'Контракт успешно отправлен!', ephemeral: true });
  }
});

// Логика кнопки
client.on(Events.InteractionCreate, async interaction => {
  if (!interaction.isButton()) return;
  if (interaction.customId === 'open_modal') {
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
  }
});

client.login(process.env.DISCORD_TOKEN);

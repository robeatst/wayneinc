const { Client, GatewayIntentBits, REST, Routes, SlashCommandBuilder,
        ActionRowBuilder, StringSelectMenuBuilder,
        ModalBuilder, TextInputBuilder, TextInputStyle } = require('discord.js');

const TOKEN = process.env.DISCORD_TOKEN;
const GUILD_ID = 'YOUR_GUILD_ID'; // замените на ID вашего сервера

const client = new Client({ intents: [GatewayIntentBits.Guilds] });

// -------------------- Словарь каналов --------------------
const channelsMap = {
  'Дары моря': '1427776962390261801',
  'Металлургия': '1427776981432406117',
  'Товары': '1427777104879288550',
  'Ателье': '1427777125519458384'
};

// -------------------- Регистрация Slash Command --------------------
const commands = [
  new SlashCommandBuilder()
    .setName('contracts')
    .setDescription('Заполнить форму контракта')
    .toJSON()
];

const rest = new REST({ version: '10' }).setToken(TOKEN);

(async () => {
  try {
    console.log('Started refreshing application (/) commands.');

    await rest.put(
      Routes.applicationGuildCommands(client.user?.id || 'CLIENT_ID_HERE', GUILD_ID),
      { body: commands },
    );

    console.log('Successfully reloaded application (/) commands.');
  } catch (error) {
    console.error(error);
  }
})();

// -------------------- READY --------------------
client.once('ready', () => {
  console.log(`Logged in as ${client.user.tag}`);
});

// -------------------- INTERACTION --------------------
client.on('interactionCreate', async interaction => {

  // ---------------- SelectMenu для типа контракта ----------------
  if (interaction.isChatInputCommand()) {
    if (interaction.commandName === 'contracts') {
      const row = new ActionRowBuilder().addComponents(
        new StringSelectMenuBuilder()
          .setCustomId('select_contract_type')
          .setPlaceholder('Выберите тип контракта')
          .addOptions([
            { label: 'Дары моря', value: 'Дары моря' },
            { label: 'Металлургия', value: 'Металлургия' },
            { label: 'Товары', value: 'Товары' },
            { label: 'Ателье', value: 'Ателье' },
          ])
      );

      await interaction.reply({ content: 'Выберите тип контракта:', components: [row], ephemeral: true });
    }
  }

  // ---------------- Modal ----------------
  if (interaction.isStringSelectMenu()) {
    if (interaction.customId === 'select_contract_type') {
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

      const firstRow = new ActionRowBuilder().addComponents(screenshotInput);
      const secondRow = new ActionRowBuilder().addComponents(activatedInput);

      modal.addComponents(firstRow, secondRow);

      await interaction.showModal(modal);
    }
  }

  // ---------------- Обработка модального окна ----------------
  if (interaction.isModalSubmit()) {
    const modalId = interaction.customId;
    if (modalId.startsWith('contract_modal_')) {
      const contractType = modalId.replace('contract_modal_', '');
      const screenshot = interaction.fields.getTextInputValue('screenshot');
      const activated = interaction.fields.getTextInputValue('activated');

      const channelId = channelsMap[contractType];
      const channel = await client.channels.fetch(channelId);

      if (channel) {
        await channel.send(`**${interaction.user}**\nТип контракта: ${contractType}\nСкриншот: ${screenshot}\n${activated} контракт`);
      }

      await interaction.reply({ content: 'Форма отправлена!', ephemeral: true });
    }
  }

});

client.login(TOKEN);

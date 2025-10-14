import { SlashCommandBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } from 'discord.js';

export const data = new SlashCommandBuilder()
  .setName('submit')
  .setDescription('Открывает форму отправки контракта');

export async function execute(interaction) {
  const row = new ActionRowBuilder().addComponents(
    new ButtonBuilder()
      .setCustomId('open_modal')
      .setLabel('ОТПРАВИТЬ')
      .setStyle(ButtonStyle.Primary)
  );

  await interaction.reply({ content: 'Нажмите кнопку, чтобы открыть форму:', components: [row], ephemeral: true });
}

import { ActionRowBuilder, ButtonBuilder, ButtonStyle } from 'discord.js';

export const data = { name: 'submit' };

export async function execute(message, args) {
  const row = new ActionRowBuilder().addComponents(
    new ButtonBuilder()
      .setCustomId('open_modal')
      .setLabel('ОТПРАВИТЬ')
      .setStyle(ButtonStyle.Primary)
  );

  await message.reply({ content: 'Нажмите кнопку, чтобы открыть форму:', components: [row] });
}

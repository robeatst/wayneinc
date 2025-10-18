import { SlashCommandBuilder, ModalBuilder, TextInputBuilder, TextInputStyle, ActionRowBuilder } from 'discord.js';

export default {
    data: new SlashCommandBuilder()
        .setName('submit')
        .setDescription('Пример модального окна'),

    async execute(interaction) {
        const modal = new ModalBuilder()
            .setCustomId('exampleModal')
            .setTitle('Пример');

        const input = new TextInputBuilder()
            .setCustomId('inputField')
            .setLabel("Введите текст")
            .setStyle(TextInputStyle.Short);

        const row = new ActionRowBuilder().addComponents(input);
        modal.addComponents(row);

        await interaction.showModal(modal);
    }
};

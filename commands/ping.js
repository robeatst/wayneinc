const { SlashCommandBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('ping')
        .setDescription('Проверка связи с ботом'),
    async execute(interaction) {
        await interaction.reply('Pong!');
    },
};

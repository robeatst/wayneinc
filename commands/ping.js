export const data = {
  name: 'ping'
};

export async function execute(message, args) {
  try {
    await message.reply('Pong! 🏓');
  } catch (err) {
    console.error('Ошибка в команде ping:', err);
  }
}

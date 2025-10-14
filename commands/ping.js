export const data = { name: 'ping' };

export async function execute(message, args) {
  await message.reply('Pong!');
}

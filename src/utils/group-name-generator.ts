const adjectives = ['fast', 'bright', 'cool', 'quiet', 'happy', 'smart'];
const nouns = ['lion', 'ocean', 'tree', 'cloud', 'rocket', 'panda'];

/**
 * Tạo tên group readable như "group-happy-lion-123"
 * @param prefix Tiền tố của group, mặc định là "group"
 * @returns Tên group dạng readable
 */
export function generateReadableGroupName(): string {
  const adjective = adjectives[Math.floor(Math.random() * adjectives.length)];
  const noun = nouns[Math.floor(Math.random() * nouns.length)];
  const number = Math.floor(Math.random() * 900) + 100; // từ 100 đến 999

  return `${adjective}-${noun}-${number}`;
}

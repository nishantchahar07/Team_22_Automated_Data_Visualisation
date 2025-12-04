const COLORS = {
  reset: "\x1b[0m",
  dim: "\x1b[2m",
  bold: "\x1b[1m",
  green: "\x1b[32m",
  yellow: "\x1b[33m",
  red: "\x1b[31m",
  cyan: "\x1b[36m",
};

function ts() {
  return new Date().toISOString();
}

function colorize(color, text) {
  return `${COLORS[color] || ''}${text}${COLORS.reset}`;
}

function line(level, color, msg, ...args) {
  const prefix = `${colorize('dim', ts())} ${colorize(color, level)}${COLORS.dim} |${COLORS.reset}`;
  console.log(`${prefix} ${msg}`, ...args);
}

module.exports = {
  info: (msg, ...args) => line('[INFO]', 'green', msg, ...args),
  warn: (msg, ...args) => line('[WARN]', 'yellow', msg, ...args),
  error: (msg, ...args) => line('[ERROR]', 'red', msg, ...args),
  success: (msg, ...args) => line('[OK]', 'green', msg, ...args),
  COLORS,
  colorize,
};

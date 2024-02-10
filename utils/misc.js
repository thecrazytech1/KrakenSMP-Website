function generateVerificationCode() {
  return (
    Math.random().toString(36).substring(2, 15) +
    Math.random().toString(36).substring(2, 15)
  );
}

function formatUUID(uuid) {
  return uuid.replace(
    /^(\w{8})(\w{4})(\w{4})(\w{4})(\w{12})$/,
    "$1-$2-$3-$4-$5"
  );
}

function getId(playername) {
  return fetch(`https://api.mojang.com/users/profiles/minecraft/${playername}`)
    .then((data) => data.json())
    .then((player) => formatUUID(player.id));
}

module.exports = {
  generateVerificationCode,
  formatUUID,
  getId,
};

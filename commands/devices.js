require("dotenv").config();
const axios = require("axios");
let admin = false;

const botDevices = (bot) => {
  bot.command("devices", (message) => {
    const username = message.from.username;
    const getType = async () => {
      const resType = await axios
        .get(`${process.env.URL_API}/users?telegramName=${username}`)
        .then((res) => {
          const data = res.data[0];
          const typeNumber = data.type;
          if (typeNumber === 2) {
            admin = true;
            console.log("IS ADMIN")
          } else {
            admin = false;
            return message.reply("Devi essere amministratore per vedere la lista dispositivi")
          }
        })
        .catch((err) => {
          if (err.response.status === 403) {
            admin = false;
            return message.reply("Devi essere amministratore per vedere la lista dispositivi")
          } else {
            admin = false;
            return message.reply(`Esegui di nuovo il comando /login`);
          }
        });
      const typeUser = await resType;
      return typeUser;
    };
    getType().then(() => {
      if (admin) {
        const buttonList = [];
        const getButtons = async () => {
          const response = await axios
            .get(`${process.env.URL_API}/devices`)
            .then((res) => {
              admin = true;
              const devices = res.data;
              devices.forEach((device) => {
                buttonList.push([{ text: device.name, callback_data: "1" }]);
              });
            })
            .catch((err) => {
              admin = false;
            });
          const buttonsData = await response;
          return buttonsData;
        };
        getButtons().then(() => {
          const options = {
            reply_markup: JSON.stringify({
              inline_keyboard: buttonList,
            }),
          };
          bot.telegram
            .sendMessage(
              message.chat.id,
              "Ecco la lista dei dispositivi",
              options
            )
            .then(function (sended) {
              // `sended` is the sent message.
            });
        });
      }
    });
  });
};
module.exports.botDevices = botDevices;

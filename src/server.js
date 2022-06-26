import express from "express";

const app = express();

app.all("/", (req, res) => {
  res.send("Bot is running!");
});

function keepAlive() {
  return app.listen(3000, () => {
    console.log("Server is running!");
  });
}

export { keepAlive };

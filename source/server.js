import express from "express";

const app = express();

app.all("/", (req, res) => {
  res.send("Bot is running!");
});

function keepAlive() {
  const port = 3000;

  return app.listen(port, () => {
    console.log("Server is running!");
  });
}

export { keepAlive };

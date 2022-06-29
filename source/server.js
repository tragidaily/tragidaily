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

// eslint-disable-next-line import/prefer-default-export
export { keepAlive };

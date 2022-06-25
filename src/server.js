import express from "express";

const server = express();

server.all("/", (req, res) => {
  res.send("Bot is running!");
});

function keepAlive() {
  const port = 3000;

  return server.listen(port, () => {
    console.log("Server is ready!");
  });
}

// eslint-disable-next-line import/prefer-default-export
export { keepAlive };

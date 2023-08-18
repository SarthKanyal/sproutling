const mongoose = require("mongoose");

mongoose.set("strictQuery", false);

const mongoDB =
  "mongodb+srv://sarthakkanyal:passwordKanyal@cluster0.tgtqiy8.mongodb.net/";

async function main() {
  await mongoose.connect(mongoDB);
  console.log("connected");
}

main().catch((err) => console.log(err));

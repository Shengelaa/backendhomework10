//1) Create expenses CRUD using Express js.
//2) Add pagination feature, /expenses?page=1&take=30, your server should be return 30 default.
//3) You should add validation to delete expense. The expense should be deleted by user who pass some secret key from the headers, like secret=random123.
//4) Handle errors, if user does not pass key, or if user want to delete non existing expense.
//use FS module and Express js. expenses info should be saved in expenses.json file.

const express = require("express");
const { readFile, writeFile } = require("./utils");
const app = express();

app.use(express.json());

app.get("/expenses", async (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const take = parseInt(req.query.take) || 5;

  const expenses = await readFile("expenses.json", true);

  const startIndex = (page - 1) * take;
  const endIndex = startIndex + take;

  const paginatedExpenses = expenses.slice(startIndex, endIndex);

  res.json({
    data: paginatedExpenses,
  });
});

app.post("/expenses", async (req, res) => {
  const secret = req.headers["secret"];
  if (!secret) {
    return res.status(401).json({ message: "secret" });
  }

  console.log(req.body.product);
  if (!req.body?.product) {
    return res.status(400).json({ message: "product is required" });
  }
  const expenses = await readFile("expenses.json", true);

  const lastId = expenses[expenses.length - 1]?.id || 0;
  const newExpense = {
    id: lastId + 1,
    secret,
    product: req.body.product,
    createdAt: new Date().toISOString(),
  };

  expenses.push(newExpense);

  await writeFile("expenses.json", JSON.stringify(expenses));
  res
    .status(201)
    .json({ message: "post created successfully", data: newExpense });
});

app.get("/expenses/:id", async (req, res) => {
  const id = Number(req.params.id);
  const expenses = await readFile("expenses.json", true);

  const index = expenses.findIndex((el) => el.id === id);
  if (index === -1) {
    return res.status(404).json({ error: "post not found" });
  }

  res.json(expenses[index]);
});

app.delete("/expenses/:id", async (req, res) => {
  const secret = req.headers["secret"];
  if (!secret) {
    return res.status(401).json({ message: "Secret is needed" });
  }

  const id = Number(req.params.id);
  const expenses = await readFile("expenses.json", true);

  const index = expenses.findIndex((el) => el.id === id);
  if (index === -1) {
    return res.status(404).json({ error: "Expense not found" });
  }

  if (secret !== expenses[index].secret) {
    return res.status(401).json({ error: "You dont have permittion" });
  }

  const deletedExpense = expenses.splice(index, 1);

  await writeFile("expenses.json", JSON.stringify(expenses));

  res
    .status(200)
    .json({ message: "deleted successfully", data: deletedExpense });

  res.json(expenses[index]);
});

app.put("/expenses/:id", async (req, res) => {
  const secret = req.headers["secret"];
  if (!secret) {
    return res.status(401).json({ message: "Secret is needed" });
  }

  const id = Number(req.params.id);
  const Expenses = await readFile("Expenses.json", true);

  const index = Expenses.findIndex((el) => el.id === id);
  if (index === -1) {
    return res.status(404).json({ error: "expense not found" });
  }

  if (secret !== Expenses[index].secret) {
    return res.status(401).json({ error: "You dont have permittion" });
  }
  if (!req.body?.secret) {
    req.body.secret = Expenses[index].secret;
  }

  Expenses[index] = {
    ...Expenses[index],
    product: req.body?.product,
    secret: req.body.secret,
    updatedAt: new Date().toISOString(),
  };

  await writeFile("Expenses.json", JSON.stringify(Expenses));

  res
    .status(200)
    .json({ message: "updated successfully", data: Expenses[index] });

  res.json(Expenses[index]);
});

app.listen(4000, () => {
  console.log("Server running on http://localhost:4000");
});

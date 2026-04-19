import express, { type Request, type Response } from "express";

const app = express();
const PORT = process.env.PORT || 3000;

app.get("/", (req: Request, res: Response) => {
  res.send("Hello, Multi-Tenant SaaS API!");
});

app.listen(PORT, () => {
  console.log(`Server is running on PORT: ${PORT}`);
});

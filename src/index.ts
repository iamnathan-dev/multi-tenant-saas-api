import express, { type Request, type Response } from "express";
// @ts-ignore-next-line
import { prisma } from "./prisma/client";
import { errorHandler } from "./middleware/errorHandler.middleware.js";
import authRoutes from "./routes/auth.routes.js";
import { transporter } from "./config/nodemailer.config";
import organizationRoutes from "./routes/organization.routes";

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(errorHandler);

const PORT = process.env.PORT || 3000;

app.use("/api/auth", authRoutes);
app.use("/api/org", organizationRoutes);

const start = async () => {
  try {
    await prisma.$connect();
    console.log("✅ Database Connection Successful");

    await transporter.verify();
    console.log("✅ Email transporter is ready");

    app.listen(PORT, () => {
      console.log(`🚀 Server is running on PORT: ${PORT}`);
    });
  } catch (error) {
    console.error("❌ Something went wrong:", error);
    process.exit(1);
  }
};

start();

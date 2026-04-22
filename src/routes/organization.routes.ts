import { OrganizationController } from "@/controllers/organizations/organization.controller";
import { protectedRouteMiddleware } from "@/middleware/authentication.middleware";
import { Router } from "express";

const organizationRoutes = Router();

organizationRoutes.post(
  "/create",
  protectedRouteMiddleware,
  OrganizationController.createOrganization,
);

export default organizationRoutes;

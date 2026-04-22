import { Route } from "@/constant/constant";
import { OrganizationController } from "@/controllers/organizations/organization.controller";
import { protectedRouteMiddleware } from "@/middleware/authentication.middleware";
import { Router } from "express";

const organizationRoutes = Router();

const routes: Route[] = [
  {
    method: "post",
    path: "/create",
    handlers: [
      protectedRouteMiddleware,
      OrganizationController.createOrganization,
    ],
  },
  {
    method: "get",
    path: "/",
    handlers: [
      protectedRouteMiddleware,
      OrganizationController.getAllOrganizations,
    ],
  },
  {
    method: "get",
    path: "/:organizationId",
    handlers: [
      protectedRouteMiddleware,
      OrganizationController.getOrganization,
    ],
  },
];

routes.forEach(({ method, path, handlers }) => {
  organizationRoutes[method](path, ...handlers);
});

export default organizationRoutes;

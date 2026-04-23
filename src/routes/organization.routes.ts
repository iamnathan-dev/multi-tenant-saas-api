import { Route } from "@/constant/constant";
import { METHOD } from "@/constant/methods.constant";
import { OrganizationController } from "@/controllers/organizations/organization.controller";
import { protectedRouteMiddleware } from "@/middleware/authentication.middleware";
import { protectedRoute } from "@/util/protected";
import { withRateLimit } from "@/util/withRateLimit";
import { Router } from "express";

const organizationRoutes = Router();

const routes: Route[] = [
  {
    method: METHOD.POST,
    path: "/create",
    handlers: protectedRoute(
      ...withRateLimit(
        { capacity: 5, refillRate: 1 },
        OrganizationController.createOrganization,
      ),
    ),
  },
  {
    method: METHOD.PUT,
    path: "/:organizationId",
    handlers: protectedRoute(
      ...withRateLimit(
        { capacity: 5, refillRate: 1 },
        OrganizationController.getOrganization,
      ),
    ),
  },
  {
    method: METHOD.GET,
    path: "/",
    handlers: protectedRoute(
      ...withRateLimit(
        { capacity: 5, refillRate: 1 },
        OrganizationController.getAllOrganizations,
      ),
    ),
  },
  {
    method: METHOD.GET,
    path: "/:organizationId",
    handlers: protectedRoute(
      ...withRateLimit(
        { capacity: 5, refillRate: 1 },
        OrganizationController.getOrganization,
      ),
    ),
  },
  {
    method: METHOD.PUT,
    path: "/:organizationId",
    handlers: protectedRoute(
      ...withRateLimit(
        { capacity: 5, refillRate: 1 },
        OrganizationController.updateOrganization,
      ),
    ),
  },
];

routes.forEach(({ method, path, handlers }) => {
  organizationRoutes[method](path, ...handlers);
});

export default organizationRoutes;

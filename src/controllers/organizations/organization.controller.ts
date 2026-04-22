import { OrganizationService } from "@/service/organization/organization.service";
import { Request, Response } from "express";

export class OrganizationController {
  static async createOrganization(req: Request, res: Response) {
    const { organizationName, userId } = req.body;

    try {
      const organization = await OrganizationService.createOrganization(
        organizationName,
        userId,
      );
      return res.status(201).json({ status: "success", data: organization });
    } catch (error: any) {
      const status = error.statusCode || 500;
      res
        .status(status)
        .json({ status: "error", message: (error as Error).message });
    }
  }

  static async getAllOrganizations(req: Request, res: Response) {
    const { userId } = req.query;

    try {
      const organizations = await OrganizationService.getAllUsersOrganizations(
        userId as string,
      );
      return res.json({
        status: "success",
        count: organizations.length,
        data: organizations,
      });
    } catch (error: any) {
      const status = error.statusCode || 500;
      res
        .status(status)
        .json({ status: "error", message: (error as Error).message });
    }
  }

  static async getOrganization(req: Request, res: Response) {
    const { organizationId } = req.params;

    try {
      const organization = await OrganizationService.getOrganizationById(
        organizationId as string,
      );
      return res.json({ status: "success", data: organization });
    } catch (error: any) {
      const status = error.statusCode || 500;
      res
        .status(status)
        .json({ status: "error", message: (error as Error).message });
    }
  }
}

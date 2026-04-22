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
}

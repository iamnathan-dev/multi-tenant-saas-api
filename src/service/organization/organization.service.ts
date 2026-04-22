import { prisma } from "@/prisma/client";
import { ApiError } from "@/util/ApiError";

export class OrganizationService {
  static async createOrganization(name: string) {
    if (!name) {
      throw new ApiError("Organization name is required", 400);
    }
  }
}

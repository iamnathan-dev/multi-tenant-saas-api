import { prisma } from "@/prisma/client";
import { ApiError } from "@/util/ApiError";

export class OrganizationService {
  static async createOrganization(name: string, userId: string) {
    if (!name) {
      throw new ApiError("Organization name is required", 400);
    }

    const organization = await prisma.organization.create({
      data: {
        name,
        owner: { connect: { id: userId } },
      },
    });

    await prisma.membership.create({
      data: {
        user: { connect: { id: userId } },
        organization: { connect: { id: organization.id } },
        role: "owner",
      },
    });

    await prisma.auditLog.create({
      data: {
        organizationId: organization.id,
        userId,
        action: "create_organization",
        entityType: "organization",
        entityId: organization.id,
      },
    });

    return organization;
  }
}

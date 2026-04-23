import { prisma } from "@/prisma/client";
import { ApiError } from "@/util/ApiError";
import { sanitizeUser } from "@/util/auth";

export class OrganizationService {
  static async createOrganization(name: string, userId: string) {
    if (!name || !userId) {
      throw new ApiError("Organization name and user ID are required", 400);
    }

    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new ApiError("User not found", 404);
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

  static async getAllUsersOrganizations(userId: string) {
    if (!userId) {
      throw new ApiError("User ID is required", 400);
    }

    const memberships = await prisma.membership.findMany({
      where: { userId },
      include: {
        organization: {
          include: {
            owner: true,
          },
        },
      },
    });

    const sanitiedMemberships = memberships.map((membership) => {
      const { organization } = membership;
      const { owner, ...sanitizedOrg } = organization;
      return {
        ...sanitizedOrg,
        owner: sanitizeUser(owner),
      };
    });

    return sanitiedMemberships;
  }

  static async getOrganizationById(orgId: string) {
    const organization = await prisma.organization.findUnique({
      where: { id: orgId },
      include: {
        owner: true,
      },
    });

    if (!organization) {
      throw new ApiError("Organization not found", 404);
    }

    const { owner, ...sanitizedOrg } = organization;
    return {
      ...sanitizedOrg,
      owner: sanitizeUser(owner),
    };
  }

  static async updateOrganization(orgId: string, name: string) {
    if (!name) {
      throw new ApiError("Organization name is required", 400);
    }

    const organization = await prisma.organization.findUnique({
      where: { id: orgId },
    });

    if (!organization) {
      throw new ApiError("Organization not found", 404);
    }

    const updatedOrg = await prisma.organization.update({
      where: { id: orgId },
      data: { name },
    });

    await prisma.auditLog.create({
      data: {
        organizationId: orgId,
        userId: updatedOrg.ownerId,
        action: "update_organization",
        entityType: "organization",
        entityId: orgId,
      },
    });

    return updatedOrg;
  }
}

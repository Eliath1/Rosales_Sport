import { prisma } from "@rs/db";
import type { TestimonialStatus } from "@rs/db";

export async function listTestimonials(params?: { status?: TestimonialStatus }) {
  return prisma.testimonial.findMany({
    where: params?.status ? { status: params.status } : undefined,
    orderBy: [{ sortOrder: "asc" }, { createdAt: "desc" }],
  });
}

export async function createTestimonial(input: {
  authorName: string;
  teamName?: string;
  quote: string;
  photoUrl?: string;
  sortOrder?: number;
}) {
  return prisma.testimonial.create({
    data: {
      authorName: input.authorName,
      teamName: input.teamName,
      quote: input.quote,
      photoUrl: input.photoUrl,
      sortOrder: input.sortOrder ?? 0,
    },
  });
}

export async function updateTestimonialStatus(id: string, status: TestimonialStatus) {
  return prisma.testimonial.update({
    where: { id },
    data: { status },
  });
}

export async function deleteTestimonial(id: string) {
  return prisma.testimonial.delete({ where: { id } });
}

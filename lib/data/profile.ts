import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";

export type ProfileData = {
  id: string;
  email: string;
  name: string;
  phone: string | null;
  address: string | null;
  idType: string | null;
  idNumber: string | null;
  idVerified: boolean;
  idDocumentPath: string | null;
};

export async function getProfile(): Promise<ProfileData | null> {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return null;

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: {
      id: true,
      email: true,
      name: true,
      phone: true,
      address: true,
      idType: true,
      idNumber: true,
      idVerified: true,
      idDocumentPath: true,
    },
  });

  if (!user) return null;

  return {
    id: user.id,
    email: user.email,
    name: user.name,
    phone: user.phone,
    address: user.address,
    idType: user.idType,
    idNumber: user.idNumber,
    idVerified: user.idVerified,
    idDocumentPath: user.idDocumentPath,
  };
}

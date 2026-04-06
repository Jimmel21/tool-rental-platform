import { NextResponse } from "next/server";
import { hash } from "bcrypt";
import { prisma } from "@/lib/db";
import {
  validatePassword,
  validatePhoneTT,
  validateEmail,
  normalizePhoneTT,
} from "@/lib/validations/auth";
import { UserRole } from "@prisma/client";
import { sendWelcomeEmail } from "@/lib/email";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { email, password, name, phone } = body as {
      email?: string;
      password?: string;
      name?: string;
      phone?: string;
    };

    if (!email?.trim()) {
      return NextResponse.json(
        { error: "Email is required" },
        { status: 400 }
      );
    }
    if (!password) {
      return NextResponse.json(
        { error: "Password is required" },
        { status: 400 }
      );
    }
    if (!name?.trim()) {
      return NextResponse.json(
        { error: "Name is required" },
        { status: 400 }
      );
    }

    const emailLower = email.trim().toLowerCase();
    if (!validateEmail(emailLower)) {
      return NextResponse.json(
        { error: "Please enter a valid email address" },
        { status: 400 }
      );
    }

    const passwordCheck = validatePassword(password);
    if (!passwordCheck.valid) {
      return NextResponse.json(
        { error: passwordCheck.message },
        { status: 400 }
      );
    }

    if (phone?.trim()) {
      if (!validatePhoneTT(phone.trim())) {
        return NextResponse.json(
          {
            error:
              "Phone must be a valid Trinidad & Tobago number (+1 868 XXX XXXX)",
          },
          { status: 400 }
        );
      }
    }

    const existing = await prisma.user.findUnique({
      where: { email: emailLower },
    });
    if (existing) {
      return NextResponse.json(
        { error: "An account with this email already exists" },
        { status: 409 }
      );
    }

    const hashedPassword = await hash(password, 12);
    const normalizedPhone = phone?.trim()
      ? normalizePhoneTT(phone.trim())
      : undefined;

    const newUser = await prisma.user.create({
      data: {
        email: emailLower,
        password: hashedPassword,
        name: name.trim(),
        phone: normalizedPhone,
        role: UserRole.CUSTOMER,
      },
    });

    const siteUrl = process.env.NEXTAUTH_URL ?? "http://localhost:3000";
    sendWelcomeEmail(newUser.email, newUser.name, {
      name: newUser.name,
      toolsUrl: `${siteUrl}/tools`,
      contactUrl: `${siteUrl}/contact`,
    }).catch((err) => console.error("[email] Failed to send welcome email:", err));

    return NextResponse.json(
      { message: "Account created. You can now sign in." },
      { status: 201 }
    );
  } catch (e) {
    console.error("Register error:", e);
    return NextResponse.json(
      { error: "Something went wrong. Please try again." },
      { status: 500 }
    );
  }
}

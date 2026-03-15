import { NextResponse } from "next/server";

/**
 * Placeholder for future OTP / phone verification.
 * Clients can POST with { phone: string } or { email: string, phone: string }.
 */
export async function POST(request: Request) {
  try {
    const body = await request.json().catch(() => ({}));
    const { phone } = body as { phone?: string };

    if (!phone?.trim()) {
      return NextResponse.json(
        { error: "Phone number is required" },
        { status: 400 }
      );
    }

    // TODO: Integrate SMS/OTP provider (e.g. Twilio) for Trinidad & Tobago
    // For now return success so UI can be built
    return NextResponse.json({
      message: "Verification not yet implemented. Phone verification coming soon.",
      success: false,
    });
  } catch {
    return NextResponse.json(
      { error: "Invalid request" },
      { status: 400 }
    );
  }
}

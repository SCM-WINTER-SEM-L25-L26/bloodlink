import jwt from "jsonwebtoken"
import bcrypt from "bcryptjs"

function getJwtSecret(): string {
  const secret = process.env.JWT_SECRET
  if (!secret) {
    throw new Error(
      "JWT_SECRET environment variable is not set. Please configure it in your .env file."
    )
  }
  return secret
}

export async function hashPassword(password: string): Promise<string> {
  const salt = await bcrypt.genSalt(10)
  return bcrypt.hash(password, salt)
}

export async function verifyPassword(
  password: string,
  hashedPassword: string
): Promise<boolean> {
  return bcrypt.compare(password, hashedPassword)
}

export function createToken(userId: string): string {
  const secret = getJwtSecret()
  return jwt.sign({ userId }, secret, { expiresIn: "7d" })
}

export function verifyToken(token: string): { userId: string } | null {
  try {
    const secret = getJwtSecret()
    const decoded = jwt.verify(token, secret)
    return decoded as { userId: string }
  } catch (err) {
    return null
  }
}

import bcrypt from 'bcryptjs'

/** Cost factor. 12 keeps a login around 200ms on a small VPS. */
const ROUNDS = 12

export const hashPassword = (plain: string): Promise<string> => bcrypt.hash(plain, ROUNDS)

export const verifyPassword = (plain: string, hash: string): Promise<boolean> =>
  bcrypt.compare(plain, hash)

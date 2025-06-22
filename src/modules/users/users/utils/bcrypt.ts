import * as bcrypt from 'bcrypt';

export class Bcrypt {
  static async generateHash(password: string) {
    const salt = await bcrypt.genSalt(10);
    return bcrypt.hash(password, salt);
  }

  static async checkPassword(password: string, hash: string) {
    return bcrypt.compare(password, hash);
  }

   static async comparePasswords(args: { password: string; hash: string }): Promise<boolean> {
    return bcrypt.compare(args.password, args.hash);
  }
}
import { Injectable, OnModuleInit } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import * as fs from 'fs/promises';
import * as path from 'path';
import { StoredUser, UsersDataFile } from './types/user.types';

const DEFAULT_USER: Omit<StoredUser, 'passwordHash'> & { password: string } = {
  id: '1',
  fullName: 'Yeremi Tantraico',
  email: 'yeremitantaraico@gmail.com',
  password: '12345678',
  role: 'Admin TI',
  totpEnabled: false,
  totpSecret: null,
  totpPendingSecret: null,
  totpAccountName: null,
  totpPendingAccountName: null,
  totpSetupPromptDismissed: false,
};

@Injectable()
export class JsonStorageService implements OnModuleInit {
  private readonly dataPath = path.join(process.cwd(), 'data', 'users.json');

  async onModuleInit(): Promise<void> {
    await this.ensureDataFile();
  }

  private async ensureDataFile(): Promise<void> {
    try {
      await fs.access(this.dataPath);
    } catch {
      await fs.mkdir(path.dirname(this.dataPath), { recursive: true });
      await this.seedDefaultUser();
    }
  }

  private async seedDefaultUser(): Promise<void> {
    const passwordHash = await bcrypt.hash(DEFAULT_USER.password, 10);
    const { password: _password, ...userBase } = DEFAULT_USER;

    const data: UsersDataFile = {
      users: [
        {
          ...userBase,
          passwordHash,
        },
      ],
    };

    await fs.writeFile(this.dataPath, JSON.stringify(data, null, 2), 'utf-8');
  }

  private async readData(): Promise<UsersDataFile> {
    const raw = await fs.readFile(this.dataPath, 'utf-8');
    return JSON.parse(raw) as UsersDataFile;
  }

  private async writeData(data: UsersDataFile): Promise<void> {
    await fs.writeFile(this.dataPath, JSON.stringify(data, null, 2), 'utf-8');
  }

  async findAllUsers(): Promise<StoredUser[]> {
    const data = await this.readData();
    return data.users;
  }

  async findUserByEmail(email: string): Promise<StoredUser | null> {
    const data = await this.readData();
    const normalizedEmail = email.trim().toLowerCase();
    return (
      data.users.find(
        (user) => user.email.trim().toLowerCase() === normalizedEmail,
      ) ?? null
    );
  }

  async findUserById(id: string): Promise<StoredUser | null> {
    const data = await this.readData();
    return data.users.find((user) => user.id === id) ?? null;
  }

  async updateUser(
    id: string,
    updates: Partial<StoredUser>,
  ): Promise<StoredUser | null> {
    const data = await this.readData();
    const index = data.users.findIndex((user) => user.id === id);

    if (index === -1) {
      return null;
    }

    data.users[index] = {
      ...data.users[index],
      ...updates,
    };

    await this.writeData(data);
    return data.users[index];
  }
}

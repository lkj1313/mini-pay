import { BadRequestException, NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import * as bcrypt from 'bcrypt';

import { PrismaService } from '../prisma/prisma.service';
import { UserService } from './user.service';

jest.mock('bcrypt', () => ({
  hash: jest.fn(),
}));

describe('UserService', () => {
  let service: UserService;
  let prisma: {
    user: {
      findUnique: jest.Mock;
      findMany: jest.Mock;
      create: jest.Mock;
    };
  };

  beforeEach(async () => {
    prisma = {
      user: {
        findUnique: jest.fn(),
        findMany: jest.fn(),
        create: jest.fn(),
      },
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UserService,
        {
          provide: PrismaService,
          useValue: prisma,
        },
      ],
    }).compile();

    service = module.get<UserService>(UserService);

    jest.clearAllMocks();
  });

  describe('create', () => {
    it('유저를 생성해야 합니다', async () => {
      const dto = {
        email: 'test@test.com',
        password: '1234',
        name: '테스터',
      };

      const hashedPassword = 'hashed-password';

      const createdUser = {
        id: 'user-1',
        email: dto.email,
        name: dto.name,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      prisma.user.findUnique.mockResolvedValue(null);
      (bcrypt.hash as jest.Mock).mockResolvedValue(hashedPassword);
      prisma.user.create.mockResolvedValue(createdUser);

      const result = await service.create(dto);

      expect(prisma.user.findUnique).toHaveBeenCalledWith({
        where: { email: dto.email },
      });

      expect(bcrypt.hash).toHaveBeenCalledWith(dto.password, 10);

      expect(prisma.user.create).toHaveBeenCalledWith({
        data: {
          email: dto.email,
          password: hashedPassword,
          name: dto.name,
          wallets: {
            create: {
              type: 'MAIN',
            },
          },
        },
        select: {
          id: true,
          email: true,
          name: true,
          createdAt: true,
          updatedAt: true,
        },
      });

      expect(result).toEqual(createdUser);
    });

    it('이미 존재하는 이메일이면 BadRequestException을 던져야 합니다', async () => {
      const dto = {
        email: 'test@test.com',
        password: '1234',
        name: '테스터',
      };

      prisma.user.findUnique.mockResolvedValue({
        id: 'existing-user',
        email: dto.email,
      });

      await expect(service.create(dto)).rejects.toThrow(BadRequestException);

      expect(prisma.user.findUnique).toHaveBeenCalledWith({
        where: { email: dto.email },
      });
      expect(bcrypt.hash).not.toHaveBeenCalled();
      expect(prisma.user.create).not.toHaveBeenCalled();
    });
  });

  describe('findAll', () => {
    it('전체 유저 목록을 반환해야 합니다', async () => {
      const users = [
        {
          id: '1',
          email: 'a@test.com',
          name: 'A',
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          id: '2',
          email: 'b@test.com',
          name: 'B',
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ];

      prisma.user.findMany.mockResolvedValue(users);

      const result = await service.findAll();

      expect(prisma.user.findMany).toHaveBeenCalledWith({
        orderBy: { createdAt: 'desc' },
        select: {
          id: true,
          email: true,
          name: true,
          createdAt: true,
          updatedAt: true,
        },
      });

      expect(result).toEqual(users);
    });
  });

  describe('findOne', () => {
    it('특정 유저를 반환해야 합니다', async () => {
      const user = {
        id: 'user-1',
        email: 'test@test.com',
        name: '테스터',
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      prisma.user.findUnique.mockResolvedValue(user);

      const result = await service.findOne('user-1');

      expect(prisma.user.findUnique).toHaveBeenCalledWith({
        where: { id: 'user-1' },
        select: {
          id: true,
          email: true,
          name: true,
          createdAt: true,
          updatedAt: true,
        },
      });

      expect(result).toEqual(user);
    });

    it('유저가 없으면 NotFoundException을 던져야 합니다', async () => {
      prisma.user.findUnique.mockResolvedValue(null);

      await expect(service.findOne('not-exist-id')).rejects.toThrow(
        NotFoundException,
      );

      expect(prisma.user.findUnique).toHaveBeenCalledWith({
        where: { id: 'not-exist-id' },
        select: {
          id: true,
          email: true,
          name: true,
          createdAt: true,
          updatedAt: true,
        },
      });
    });
  });

  describe('getUserByEmail', () => {
    it('이메일로 유저를 조회해야 합니다', async () => {
      const user = {
        id: 'user-1',
        email: 'test@test.com',
        password: 'hashed-password',
        name: '테스터',
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      prisma.user.findUnique.mockResolvedValue(user);

      const result = await service.getUserByEmail('test@test.com');

      expect(prisma.user.findUnique).toHaveBeenCalledWith({
        where: { email: 'test@test.com' },
      });

      expect(result).toEqual(user);
    });
  });
});

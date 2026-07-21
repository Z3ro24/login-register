import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { PrismaService } from '../prisma/prisma.service';
import * as bcrypt from 'bcrypt';

@Injectable()
export class UsersService {
  constructor(private readonly prisma: PrismaService) {}

  async create(createUserDto: CreateUserDto) {
    const { name, email, password } = createUserDto;

    // Check if email already exists
    const existingUser = await this.findByEmail(email);
    if (existingUser) {
      throw new ConflictException('A user with this email already exists');
    }

    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Save user record
    const user = await this.prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
      },
    });

    // Exclude the password field from the return value
    const { password: _, ...userWithoutPassword } = user;
    return userWithoutPassword;
  }

  async findByEmail(email: string) {
    return this.prisma.user.findUnique({
      where: { email },
    });
  }

  async findOne(id: string) {
    const user = await this.prisma.user.findUnique({
      where: { id },
    });

    if (!user) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }

    const { password: _, ...userWithoutPassword } = user;
    return userWithoutPassword;
  }

  async update(id: string, updateUserDto: UpdateUserDto) {
    // Check if the user exists
    const existingUser = await this.prisma.user.findUnique({
      where: { id },
    });
    if (!existingUser) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }

    const { email, password, name, isActive } = updateUserDto;

    // If changing email, check for uniqueness conflicts
    if (email && email !== existingUser.email) {
      const emailConflict = await this.findByEmail(email);
      if (emailConflict) {
        throw new ConflictException('A user with this email already exists');
      }
    }

    // Hash new password if updated
    const updateData: any = {};
    if (name !== undefined) updateData.name = name;
    if (email !== undefined) updateData.email = email;
    if (isActive !== undefined) updateData.isActive = isActive;
    
    if (password) {
      updateData.password = await bcrypt.hash(password, 10);
    }

    const updatedUser = await this.prisma.user.update({
      where: { id },
      data: updateData,
    });

    const { password: _, ...userWithoutPassword } = updatedUser;
    return userWithoutPassword;
  }

  async remove(id: string) {
    // Check if the user exists
    const existingUser = await this.prisma.user.findUnique({
      where: { id },
    });
    if (!existingUser) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }

    // Perform soft delete
    const deletedUser = await this.prisma.user.update({
      where: { id },
      data: {
        isActive: false,
        deleteAt: new Date(),
      },
    });

    const { password: _, ...userWithoutPassword } = deletedUser;
    return userWithoutPassword;
  }
}

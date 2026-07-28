import { IsEmail, IsEnum, IsNotEmpty, IsOptional, IsString, MinLength, Matches } from 'class-validator';
import { Role } from '../../common/enums/role.enum';

export class CreateUserDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsEmail()
  @IsNotEmpty()
  email: string;

  @IsString()
  @IsNotEmpty()
  @MinLength(8, { message: 'Password must be at least 8 characters long.' })
  @Matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/, {
    message:
      'Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character (@$!%*?&).',
  })
  password: string;

  @IsEnum(Role)
  @IsOptional()
  role?: Role;
}

import { applyDecorators, UseGuards } from '@nestjs/common';
import { Role } from '../../common/enums/role.enum';
import { Roles } from './roles.decorator';
import { AuthGuard } from '../guards/auth.guard';
import { RolesGuard } from '../guards/roles.guard';

export const Auth = (...roles: Role[]) => applyDecorators(
  Roles(...roles),
  UseGuards(AuthGuard, RolesGuard),
);

import { Controller, Get, Post, Body, UseGuards, Req } from '@nestjs/common';
import { AuthService } from './auth.service';
import { JwtAuthGuard } from './jwt-auth.guard';
import { LoginDto } from './dto/login.dto';
import { AcceptInvitationDto } from './dto/accept-invitation.dto';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('login')
  async login(@Body() dto: LoginDto) {
    const user = await this.authService.validateUser(dto.email, dto.password);
    return this.authService.login({ id: user.id, email: user.email, rolId: user.rolId });
  }

  @Post('accept-invitation')
  async acceptInvitation(@Body() dto: AcceptInvitationDto) {
    return this.authService.acceptInvitation(dto.token, dto.password);
  }

  @UseGuards(JwtAuthGuard)
  @Get('me')
  async me(@Req() req: any) {
    return req.user;
  }
}

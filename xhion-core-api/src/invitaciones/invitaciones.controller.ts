import { Controller, Post, Body } from '@nestjs/common';
import { InvitacionesService } from './invitaciones.service';
import { CreateInvitacionDto } from './dto/create-invitacion.dto';

@Controller('invitaciones')
export class InvitacionesController {

constructor(private readonly invitacionesService: InvitacionesService) {}

  @Post()
  create(@Body() createInvitacionDto: CreateInvitacionDto) {
    return this.invitacionesService.create(createInvitacionDto);
  }

}

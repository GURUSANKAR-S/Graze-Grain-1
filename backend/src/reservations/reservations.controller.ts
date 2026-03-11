import {
  Body,
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { successResponse } from '../common/http/response.util';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { ReservationsService } from './reservations.service';
import { CreateReservationDto } from './dto/create-reservation.dto';
import { ReservationsQueryDto } from './dto/reservations-query.dto';
import { AcknowledgeReservationDto } from './dto/acknowledge-reservation.dto';

@Controller('reservations')
export class ReservationsController {
  constructor(private readonly reservationsService: ReservationsService) {}

  @Post()
  async create(@Body() dto: CreateReservationDto) {
    const data = await this.reservationsService.createReservation(dto);
    return successResponse(data);
  }

  @Get()
  @UseGuards(JwtAuthGuard)
  async list(@Query() query: ReservationsQueryDto) {
    const { items, meta } =
      await this.reservationsService.listReservations(query);
    return successResponse(items, meta);
  }

  @Patch(':id/acknowledge')
  @UseGuards(JwtAuthGuard)
  async acknowledge(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: AcknowledgeReservationDto,
  ) {
    const data = await this.reservationsService.acknowledgeReservation(
      id,
      dto.admin_note,
    );
    return successResponse(data);
  }
}

import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateReservationDto } from './dto/create-reservation.dto';
import { ReservationsQueryDto } from './dto/reservations-query.dto';

@Injectable()
export class ReservationsService {
  constructor(private readonly prisma: PrismaService) {}

  async createReservation(dto: CreateReservationDto) {
    const reservationDateTime = new Date(
      `${dto.reservation_date}T${dto.reservation_time}:00`,
    );

    const reservation = await this.prisma.reservation.create({
      data: {
        customerName: dto.customer_name.trim(),
        phone: dto.phone.trim(),
        email: dto.email?.trim(),
        reservationDate: reservationDateTime,
        guestCount: dto.guest_count,
        specialRequest: dto.special_request?.trim(),
      },
    });

    return this.mapReservation(reservation);
  }

  async listReservations(query: ReservationsQueryDto) {
    const where = query.status ? { status: query.status } : {};
    const [items, total] = await Promise.all([
      this.prisma.reservation.findMany({
        where,
        orderBy: [{ status: 'asc' }, { reservationDate: 'asc' }],
        skip: (query.page - 1) * query.limit,
        take: query.limit,
      }),
      this.prisma.reservation.count({ where }),
    ]);

    return {
      items: items.map((item) => this.mapReservation(item)),
      meta: {
        page: query.page,
        limit: query.limit,
        total,
        totalPages: Math.max(1, Math.ceil(total / query.limit)),
      },
    };
  }

  async acknowledgeReservation(id: number, adminNote?: string) {
    const existing = await this.prisma.reservation.findUnique({
      where: { id },
    });

    if (!existing) {
      throw new NotFoundException({
        code: 'RESERVATION_NOT_FOUND',
        message: 'Reservation not found',
      });
    }

    const updated = await this.prisma.reservation.update({
      where: { id },
      data: {
        status: 'acknowledged',
        acknowledgedAt: new Date(),
        specialRequest:
          adminNote && adminNote.trim().length > 0
            ? `${existing.specialRequest ? `${existing.specialRequest}\n\n` : ''}Admin note: ${adminNote.trim()}`
            : existing.specialRequest,
      },
    });

    return this.mapReservation(updated);
  }

  private mapReservation(item: {
    id: number;
    customerName: string;
    phone: string;
    email: string | null;
    reservationDate: Date;
    guestCount: number;
    specialRequest: string | null;
    status: 'pending' | 'acknowledged';
    acknowledgedAt: Date | null;
    createdAt: Date;
    updatedAt: Date;
  }) {
    return {
      id: item.id,
      customer_name: item.customerName,
      phone: item.phone,
      email: item.email,
      reservation_date: item.reservationDate.toISOString().slice(0, 10),
      reservation_time: item.reservationDate.toISOString().slice(11, 16),
      guest_count: item.guestCount,
      special_request: item.specialRequest,
      status: item.status,
      acknowledged_at: item.acknowledgedAt,
      created_at: item.createdAt,
      updated_at: item.updatedAt,
    };
  }
}

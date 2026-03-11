DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'ReservationStatus') THEN
    CREATE TYPE "ReservationStatus" AS ENUM ('pending', 'acknowledged');
  END IF;
END
$$;

CREATE TABLE IF NOT EXISTS reservations (
  id SERIAL PRIMARY KEY,
  customer_name VARCHAR(150) NOT NULL,
  phone VARCHAR(30) NOT NULL,
  email VARCHAR(255),
  reservation_date TIMESTAMPTZ NOT NULL,
  guest_count SMALLINT NOT NULL,
  special_request TEXT,
  status "ReservationStatus" NOT NULL DEFAULT 'pending',
  acknowledged_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS reservations_status_reservation_date_idx
ON reservations (status, reservation_date);

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'reservations_guest_count_positive'
  ) THEN
    ALTER TABLE reservations
      ADD CONSTRAINT reservations_guest_count_positive
      CHECK (guest_count > 0);
  END IF;
END
$$;

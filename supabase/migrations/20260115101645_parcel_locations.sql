-- Migration: Add lat and lng columns to parcels table
ALTER TABLE public.parcels
ADD COLUMN lat double precision,
ADD COLUMN lng double precision;

import { RowDataPacket } from "mysql2";

export interface UserPayload {
  id: number;
  email: string;
  role: string;
  iat?: number;
  exp?: number;
}

export interface UserRow extends RowDataPacket {
  id: number;
  email: string;
  password: string;
  pseudo: string;
  role: string;
  coins: number;
  created_at: Date;
  is_first_login: boolean;
}

export interface MonsterRow extends RowDataPacket {
  id: number;
  user_id: number;
  specie_id: number;
  level: number;
  stade: number;
  is_finished: boolean;
  is_archived: boolean;
  last_update: Date | null;
  created_at: Date;
  species_name?: string;
  hunger_interval_hours?: number;
  max_level?: number;
  base_image_url?: string;
}

export interface SpeciesRow extends RowDataPacket {
  id: number;
  name: string;
  unlock_cost: number;
  hunger_interval_hours: number;
  max_level: number;
  base_image_url: string;
  is_starter: boolean;
}

export interface DecorationRow extends RowDataPacket {
  id: number;
  name: string;
  description: string;
  price: number;
  image_url: string;
}

export interface UserDecorationRow extends RowDataPacket {
  user_decoration_id: number;
  is_equipped: boolean;
  position_x: number | null;
  position_y: number | null;
  purchased_at: Date;
  id: number;
  name: string;
  description: string;
  price: number;
  image_url: string;
}

export interface CoinRow extends RowDataPacket {
  coins: number;
}

declare global {
  namespace Express {
    interface Request {
      user?: UserPayload;
    }
  }
}

export type Suit = '♠' | '♥' | '♦' | '♣';
export type Rank = '2' | '3' | '4' | '5' | '6' | '7' | '8' | '9' | '10' | 'J' | 'Q' | 'K' | 'A';

export interface Card {
  id: string; // e.g., '2♠'
  suit: Suit;
  rank: Rank;
  value: number; // 2-14
}

export type Avatar = '🐼' | '🐱' | '🦊' | '🐻' | '🐰' | '🐶' | '🐵' | '🤖';

export interface Player {
  id: string; // Socket ID
  name: string;
  avatar: Avatar;
  isReady: boolean;
  connected: boolean;
}

export interface PlayedCard {
  playerId: string;
  card: Card;
}

export interface ChatMessage {
  id: string;
  senderId: string;
  senderName: string;
  text: string;
  timestamp: number;
}

export type GameStatus = 'lobby' | 'playing' | 'paused' | 'finished';

export interface RoomState {
  roomId: string;
  players: Player[];
  spectators?: Player[];
  hostId: string;
  status: GameStatus;
  
  // Chat
  chatHistory: ChatMessage[];

  
  // Game state (only sent when playing)
  trumpSuit: Suit | null;
  leadSuit: Suit | null;
  currentTurn: string | null;
  currentTrick: PlayedCard[];
  trickWinner: string | null;
  tricksWon: Record<string, number>;
  roundPoints: Record<string, number>; // Points from trump cards won in current round
  scores: Record<string, number>;
  scoreHistory: Array<Record<string, number>>; // Tracks scores per round
  roundNumber: number;
  winner: string | null;
  
  // Player specific state (hand is sent separately to each player)
  // hands are not in the public room state
}

export interface ClientGameState extends RoomState {
  hand: Card[]; // The current player's hand
}

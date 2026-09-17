import { Server, Socket } from "socket.io";
import { RoomState, Card, Player, Suit, Rank, PlayedCard } from "../types.js";

// Helper logic
const SUITS: Suit[] = ['♠', '♥', '♦', '♣'];
const RANKS: Rank[] = ['2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K', 'A'];
const RANK_VALUES: Record<Rank, number> = {
  '2': 2, '3': 3, '4': 4, '5': 5, '6': 6, '7': 7, '8': 8, '9': 9, '10': 10,
  'J': 11, 'Q': 12, 'K': 13, 'A': 14
};

function createDeck(): Card[] {
  const deck: Card[] = [];
  for (const suit of SUITS) {
    for (const rank of RANKS) {
      deck.push({ id: `${rank}${suit}`, suit, rank, value: RANK_VALUES[rank] });
    }
  }
  return deck;
}

function shuffleDeck(deck: Card[]): Card[] {
  const shuffled = [...deck];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

interface InternalRoom extends RoomState {
  hands: Record<string, Card[]>; // socketId -> Card[]
  deck: Card[];
}

const rooms = new Map<string, InternalRoom>();
const playerToRoom = new Map<string, string>(); // socketId -> roomId

export function setupGameHandlers(io: Server) {
  io.on("connection", (socket: Socket) => {
    console.log("Client connected:", socket.id);

    // Send state to a single socket safely without exposing other hands
    const sendStateToSocket = (roomId: string, targetSocketId: string) => {
      const room = rooms.get(roomId);
      if (!room) return;
      const { hands, deck, ...publicState } = room;
      io.to(targetSocketId).emit("gameState", {
        ...publicState,
        hand: hands[targetSocketId] || []
      });
    };

    // Broadcast state to all players and spectators in the room
    const broadcastState = (roomId: string) => {
      const room = rooms.get(roomId);
      if (!room) return;
      
      for (const player of room.players) {
        if (player.connected) {
          sendStateToSocket(roomId, player.id);
        }
      }
      
      if (room.spectators) {
        for (const spectator of room.spectators) {
          if (spectator.connected) {
            sendStateToSocket(roomId, spectator.id);
          }
        }
      }
    };

    socket.on("createRoom", (data: { name: string; avatar: any }, callback: (res: any) => void) => {
      // Clean up previous room if any
      const oldRoomId = playerToRoom.get(socket.id);
      if (oldRoomId) handleDisconnect(socket.id, io);

      const roomId = Math.random().toString(36).substring(2, 8).toUpperCase();
      const player: Player = { id: socket.id, name: data.name, avatar: data.avatar, isReady: false, connected: true };
      
      const newRoom: InternalRoom = {
        roomId,
        players: [player],
        spectators: [],
        hostId: socket.id,
        status: 'lobby',
        chatHistory: [],
        trumpSuit: '♠',
        leadSuit: null,
        currentTurn: null,
        currentTrick: [],
        trickWinner: null,
        tricksWon: {},
        roundPoints: {},
        scores: {},
        scoreHistory: [],
        roundNumber: 0,
        winner: null,
        hands: {},
        deck: []
      };
      
      rooms.set(roomId, newRoom);
      playerToRoom.set(socket.id, roomId);
      socket.join(roomId);
      
      broadcastState(roomId);
      if (callback) callback({ success: true, roomId });
    });

    socket.on("joinRoom", (data: { roomId: string; name: string; avatar: any; isSpectator?: boolean }, callback: (res: any) => void) => {
      const roomId = data.roomId.toUpperCase();
      const room = rooms.get(roomId);
      
      if (!room) {
        if (callback) callback({ success: false, error: "Room not found" });
        return;
      }
      
      // Clean up previous room if any
      const oldRoomId = playerToRoom.get(socket.id);
      if (oldRoomId) handleDisconnect(socket.id, io);

      if (data.isSpectator) {
        if (!room.spectators) room.spectators = [];
        const spectator: Player = { id: socket.id, name: data.name, avatar: data.avatar, isReady: true, connected: true };
        room.spectators.push(spectator);
        playerToRoom.set(socket.id, roomId);
        socket.join(roomId);
        broadcastState(roomId);
        if (callback) callback({ success: true, roomId });
        return;
      }

      if (room.status !== 'lobby') {
        // Try to find a disconnected player with the same name to reconnect
        const disconnectedPlayer = room.players.find(p => p.name === data.name && !p.connected);
        if (disconnectedPlayer) {
          const oldId = disconnectedPlayer.id;
          
          // Reassign player ID and state
          disconnectedPlayer.id = socket.id;
          disconnectedPlayer.connected = true;
          disconnectedPlayer.avatar = data.avatar;
          
          if (room.hands[oldId]) {
            room.hands[socket.id] = room.hands[oldId];
            delete room.hands[oldId];
          }
          if (room.scores[oldId] !== undefined) {
            room.scores[socket.id] = room.scores[oldId];
            delete room.scores[oldId];
          }
          if (room.tricksWon[oldId] !== undefined) {
            room.tricksWon[socket.id] = room.tricksWon[oldId];
            delete room.tricksWon[oldId];
          }
          if (room.roundPoints[oldId] !== undefined) {
            room.roundPoints[socket.id] = room.roundPoints[oldId];
            delete room.roundPoints[oldId];
          }
          if (room.currentTurn === oldId) room.currentTurn = socket.id;
          if (room.hostId === oldId) room.hostId = socket.id;
          if (room.trickWinner === oldId) room.trickWinner = socket.id;
          if (room.winner === oldId) room.winner = socket.id;
          
          room.currentTrick.forEach(t => {
            if (t.playerId === oldId) t.playerId = socket.id;
          });
          
          playerToRoom.set(socket.id, roomId);
          socket.join(roomId);
          broadcastState(roomId);
          if (callback) callback({ success: true, roomId });
          return;
        }

        if (callback) callback({ success: false, error: "Game already started" });
        return;
      }

      if (room.players.length >= 8) { // max 8 for this example
        if (callback) callback({ success: false, error: "Room is full" });
        return;
      }

      const player: Player = { id: socket.id, name: data.name, avatar: data.avatar, isReady: false, connected: true };
      room.players.push(player);
      playerToRoom.set(socket.id, roomId);
      socket.join(roomId);
      
      broadcastState(roomId);
      if (callback) callback({ success: true, roomId });
    });

    socket.on("sendMessage", (data: { text: string }) => {
      const roomId = playerToRoom.get(socket.id);
      if (!roomId) return;
      const room = rooms.get(roomId);
      if (!room) return;

      let senderName = "Unknown";
      const player = room.players.find(p => p.id === socket.id);
      const spectator = room.spectators?.find(p => p.id === socket.id);
      
      if (player) senderName = player.name;
      else if (spectator) senderName = spectator.name;

      const chatMsg = {
        id: Math.random().toString(36).substring(2, 10),
        senderId: socket.id,
        senderName,
        text: data.text,
        timestamp: Date.now(),
      };

      if (!room.chatHistory) {
        room.chatHistory = [];
      }

      room.chatHistory.push(chatMsg);
      // Keep only last 50 messages to prevent memory leak
      if (room.chatHistory.length > 50) {
        room.chatHistory.shift();
      }

      broadcastState(roomId);
    });

    socket.on("toggleReady", () => {
      const roomId = playerToRoom.get(socket.id);
      if (!roomId) return;
      const room = rooms.get(roomId);
      if (!room || room.status !== 'lobby') return;
      
      const player = room.players.find(p => p.id === socket.id);
      if (player) {
        player.isReady = !player.isReady;
        broadcastState(roomId);
      }
    });

    socket.on("setTrumpSuit", (data: { suit: Suit }) => {
      const roomId = playerToRoom.get(socket.id);
      if (!roomId) return;
      const room = rooms.get(roomId);
      if (!room || room.status !== 'lobby' || room.hostId !== socket.id) return;
      
      room.trumpSuit = data.suit;
      broadcastState(roomId);
    });

    socket.on("startGame", () => {
      const roomId = playerToRoom.get(socket.id);
      if (!roomId) return;
      const room = rooms.get(roomId);
      if (!room || room.status !== 'lobby' || room.hostId !== socket.id) return;
      
      const allReady = room.players.every(p => p.isReady);
      if (!allReady && room.players.length > 1) return; // For testing alone it's fine
      
      if (room.players.length < 2) return; // Need at least 2 players

      startNewRound(room);
      broadcastState(roomId);
    });

    socket.on("playCard", (data: { cardId: string }) => {
      const roomId = playerToRoom.get(socket.id);
      if (!roomId) return;
      const room = rooms.get(roomId);
      if (!room || room.status !== 'playing' || room.currentTurn !== socket.id) return;
      
      const hand = room.hands[socket.id];
      if (!hand) return;
      
      const cardIndex = hand.findIndex(c => c.id === data.cardId);
      if (cardIndex === -1) return;
      
      const card = hand[cardIndex];
      
      // Validate card
      if (room.leadSuit) {
        const hasLeadSuit = hand.some(c => c.suit === room.leadSuit);
        if (hasLeadSuit && card.suit !== room.leadSuit) {
          // Illegal move
          return;
        }
      }
      
      // Remove card from hand
      hand.splice(cardIndex, 1);
      
      // Set lead suit if first card
      if (room.currentTrick.length === 0) {
        room.leadSuit = card.suit;
      }
      
      // Add to trick
      room.currentTrick.push({ playerId: socket.id, card });
      
      // Determine next turn or evaluate trick
      if (room.currentTrick.length === room.players.length) {
        // Trick complete
        room.currentTurn = null; // No one's turn
        evaluateTrick(room);
      } else {
        // Next player's turn
        const currentPlayerIndex = room.players.findIndex(p => p.id === socket.id);
        const nextPlayerIndex = (currentPlayerIndex + 1) % room.players.length;
        room.currentTurn = room.players[nextPlayerIndex].id;
      }
      
      broadcastState(roomId);
    });
    
    socket.on("pauseGame", () => {
      const roomId = playerToRoom.get(socket.id);
      if (!roomId) return;
      const room = rooms.get(roomId);
      if (!room || room.status === 'lobby') return;
      
      // Only host or any player? Let's say any player can pause for simplicity
      if (room.status === 'playing') {
        room.status = 'paused';
      } else if (room.status === 'paused') {
        room.status = 'playing';
      }
      broadcastState(roomId);
    });

    socket.on("resetGame", () => {
       const roomId = playerToRoom.get(socket.id);
       if (!roomId) return;
       const room = rooms.get(roomId);
       if (!room || room.hostId !== socket.id) return;
       
       room.status = 'lobby';
       room.players.forEach(p => p.isReady = false);
       room.scores = {};
       room.scoreHistory = [];
       room.tricksWon = {};
       room.roundPoints = {};
       room.roundNumber = 0;
       broadcastState(roomId);
    });

    socket.on("disconnect", () => {
      handleDisconnect(socket.id, io);
    });
    
    function evaluateTrick(room: InternalRoom) {
      setTimeout(() => {
        // Ensure room still exists
        if (!rooms.has(room.roomId)) return;
        
        let winningCard = room.currentTrick[0];
        
        for (let i = 1; i < room.currentTrick.length; i++) {
          const current = room.currentTrick[i];
          const best = winningCard;
          
          if (current.card.suit === room.trumpSuit && best.card.suit !== room.trumpSuit) {
            winningCard = current;
          } else if (current.card.suit === best.card.suit && current.card.value > best.card.value) {
            winningCard = current;
          }
        }
        
        const winnerId = winningCard.playerId;
        room.trickWinner = winnerId;
        room.tricksWon[winnerId] = (room.tricksWon[winnerId] || 0) + 1;
        
        let trickPoints = 0;
        for (const played of room.currentTrick) {
          trickPoints += played.card.value;
        }
        room.roundPoints[winnerId] = (room.roundPoints[winnerId] || 0) + trickPoints;
        
        broadcastState(room.roomId);
        
        // Wait a bit before clearing trick
        setTimeout(() => {
          if (!rooms.has(room.roomId)) return;

          room.currentTrick = [];
          room.leadSuit = null;
          room.trickWinner = null;
          room.currentTurn = winnerId; // Winner starts next trick
          
          // Check if round is over (no cards in hands)
          const anyCardsLeft = Object.values(room.hands).some(h => h.length > 0);
          if (!anyCardsLeft) {
            // End round
            const roundScores: Record<string, number> = {};
            for (const [pId, points] of Object.entries(room.roundPoints)) {
              roundScores[pId] = points;
              room.scores[pId] = (room.scores[pId] || 0) + points;
            }
            room.scoreHistory.push(roundScores);
            
            if (room.roundNumber >= 4) {
              room.status = 'finished';
              
              let maxScore = -1;
              let winner = null;
              for (const [pId, score] of Object.entries(room.scores)) {
                if (score > maxScore) {
                  maxScore = score;
                  winner = pId;
                }
              }
              room.winner = winner;
            } else {
              // Automatically start the next round
              startNewRound(room);
            }
          }
          broadcastState(room.roomId);
        }, 2000); // 2 second delay to see who won
      }, 500); // Small delay before calculating winner for animation sync
    }

  });
  
  function handleDisconnect(socketId: string, io: Server) {
    console.log("Client disconnected:", socketId);
    const roomId = playerToRoom.get(socketId);
    if (!roomId) return;
    
    const room = rooms.get(roomId);
    if (!room) return;
    
    const playerIndex = room.players.findIndex(p => p.id === socketId);
    const spectatorIndex = room.spectators?.findIndex(p => p.id === socketId) ?? -1;

    if (spectatorIndex !== -1 && room.spectators) {
      room.spectators.splice(spectatorIndex, 1);
      // Ensure we broadcast this change to the room
      if (rooms.has(roomId)) {
         // use broadcast logic if needed, but here we can just rely on the same notification loop below
      }
    } else if (playerIndex !== -1) {
      if (room.status === 'lobby') {
        room.players.splice(playerIndex, 1);
        if (room.players.length === 0) {
          rooms.delete(roomId);
        } else if (room.hostId === socketId) {
          room.hostId = room.players[0].id;
        }
      } else {
        // Just mark as disconnected to allow reconnect
        room.players[playerIndex].connected = false;
        
        // Ensure there is always a host
        if (room.hostId === socketId) {
          const nextHost = room.players.find(p => p.connected);
          if (nextHost) room.hostId = nextHost.id;
        }

        const allDisconnected = room.players.every(p => !p.connected);
        if (allDisconnected) {
          room.players.forEach(p => playerToRoom.delete(p.id));
          rooms.delete(roomId);
        }
      }
      
      // Notify remaining
      if (rooms.has(roomId)) {
        const remainingRoom = rooms.get(roomId)!;
        for (const player of remainingRoom.players) {
          if (player.connected) {
            const { hands, deck, ...publicState } = remainingRoom;
            io.to(player.id).emit("gameState", {
              ...publicState,
              hand: hands[player.id] || []
            });
          }
        }
        if (remainingRoom.spectators) {
          for (const spectator of remainingRoom.spectators) {
            if (spectator.connected) {
              const { hands, deck, ...publicState } = remainingRoom;
              io.to(spectator.id).emit("gameState", {
                ...publicState,
                hand: []
              });
            }
          }
        }
      }
    }
    playerToRoom.delete(socketId);
  }
}

function startNewRound(room: InternalRoom) {
  room.deck = shuffleDeck(createDeck());
  room.roundNumber += 1;
  room.status = 'playing';
  room.tricksWon = {};
  room.roundPoints = {};
  room.currentTrick = [];
  room.trickWinner = null;
  room.leadSuit = null;
  room.winner = null;
  
  // Deal cards evenly
  const numPlayers = room.players.length;
  const cardsPerPlayer = Math.floor(room.deck.length / numPlayers);
  
  for (let i = 0; i < numPlayers; i++) {
    const pId = room.players[i].id;
    room.hands[pId] = room.deck.splice(0, cardsPerPlayer);
    // Sort hands (by suit then value)
    room.hands[pId].sort((a, b) => {
      if (a.suit !== b.suit) return a.suit.localeCompare(b.suit);
      return b.value - a.value; // highest to lowest
    });
  }
  
  // Trump rotates each round (Spades, Hearts, Diamonds, Clubs)
  const roundSuits: Suit[] = ['♠', '♥', '♦', '♣'];
  room.trumpSuit = roundSuits[(room.roundNumber - 1) % 4];
  
  // Host starts first
  room.currentTurn = room.hostId;
}

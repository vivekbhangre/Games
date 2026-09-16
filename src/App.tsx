/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect } from 'react';
import { io, Socket } from 'socket.io-client';
import { ClientGameState, Player, Avatar } from './types';
import Landing from './components/Landing';
import Lobby from './components/Lobby';
import GameTable from './components/GameTable';
import ThemeToggle from './components/ThemeToggle';

// Connect to the socket server
const socket: Socket = io(window.location.origin);

export default function App() {
  const [gameState, setGameState] = useState<ClientGameState | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [myName, setMyName] = useState('');
  const [myAvatar, setMyAvatar] = useState<Avatar>('🐼');

  useEffect(() => {
    socket.on('gameState', (state: ClientGameState) => {
      setGameState(state);
      setError(null);
    });

    socket.on('connect_error', () => {
      setError('Connection lost. Trying to reconnect...');
    });

    return () => {
      socket.off('gameState');
      socket.off('connect_error');
    };
  }, []);

  const handleCreateGame = (name: string, avatar: Avatar) => {
    setMyName(name);
    setMyAvatar(avatar);
    socket.emit('createRoom', { name, avatar }, (res: any) => {
      if (!res.success) setError(res.error);
    });
  };

  const handleJoinGame = (roomId: string, name: string, avatar: Avatar) => {
    setMyName(name);
    setMyAvatar(avatar);
    socket.emit('joinRoom', { roomId, name, avatar }, (res: any) => {
      if (!res.success) setError(res.error);
    });
  };

  const handleToggleReady = () => {
    socket.emit('toggleReady');
  };

  const handleStartGame = () => {
    socket.emit('startGame');
  };

  const handleSetTrumpSuit = (suit: string) => {
    socket.emit('setTrumpSuit', { suit });
  };

  const handlePlayCard = (cardId: string) => {
    socket.emit('playCard', { cardId });
  };
  
  const handlePause = () => {
    socket.emit('pauseGame');
  };

  const handleReset = () => {
    socket.emit('resetGame');
  };

  if (!gameState) {
    return (
      <>
        <ThemeToggle />
        <Landing onCreate={handleCreateGame} onJoin={handleJoinGame} error={error} />
      </>
    );
  }

  if (gameState.status === 'lobby') {
    return (
      <>
        <ThemeToggle />
        <Lobby 
          gameState={gameState} 
          socketId={socket.id || ''} 
          onReady={handleToggleReady} 
          onStart={handleStartGame} 
          onSetTrumpSuit={handleSetTrumpSuit}
        />
      </>
    );
  }

  return (
    <>
      <ThemeToggle />
      <GameTable 
        gameState={gameState} 
        socketId={socket.id || ''} 
        onPlayCard={handlePlayCard}
        onPause={handlePause}
        onReset={handleReset}
      />
    </>
  );
}


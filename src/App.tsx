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
    const onConnect = () => {
      const savedSessionStr = sessionStorage.getItem('cousinsGameSession');
      if (savedSessionStr) {
        try {
          const session = JSON.parse(savedSessionStr);
          if (session.roomId && session.name) {
            socket.emit('joinRoom', session, (res: any) => {
              if (!res.success) {
                sessionStorage.removeItem('cousinsGameSession');
                setGameState(null);
                setError(res.error || 'Failed to rejoin game.');
              } else {
                setMyName(session.name);
                setMyAvatar(session.avatar);
              }
            });
          }
        } catch (e) {
          sessionStorage.removeItem('cousinsGameSession');
        }
      }
    };

    socket.on('connect', onConnect);
    if (socket.connected) {
      onConnect();
    }

    socket.on('gameState', (state: ClientGameState) => {
      setGameState(state);
      setError(null);
    });

    socket.on('connect_error', () => {
      setError('Connection lost. Trying to reconnect...');
    });

    return () => {
      socket.off('connect', onConnect);
      socket.off('gameState');
      socket.off('connect_error');
    };
  }, []);

  const handleCreateGame = (name: string, avatar: Avatar) => {
    setMyName(name);
    setMyAvatar(avatar);
    socket.emit('createRoom', { name, avatar }, (res: any) => {
      if (!res.success) {
        setError(res.error);
      } else {
        sessionStorage.setItem('cousinsGameSession', JSON.stringify({ roomId: res.roomId, name, avatar, isSpectator: false }));
      }
    });
  };

  const handleJoinGame = (roomId: string, name: string, avatar: Avatar, isSpectator = false) => {
    setMyName(name);
    setMyAvatar(avatar);
    socket.emit('joinRoom', { roomId, name, avatar, isSpectator }, (res: any) => {
      if (!res.success) {
        setError(res.error);
      } else {
        sessionStorage.setItem('cousinsGameSession', JSON.stringify({ roomId: res.roomId || roomId, name, avatar, isSpectator }));
      }
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

  const handleSendMessage = (text: string) => {
    socket.emit('sendMessage', { text });
  };

  if (!gameState) {
    return (
      <Landing onCreate={handleCreateGame} onJoin={handleJoinGame} error={error} />
    );
  }

  if (gameState.status === 'lobby') {
    return (
      <Lobby 
        gameState={gameState} 
        socketId={socket.id || ''} 
        onReady={handleToggleReady} 
        onStart={handleStartGame} 
        onSetTrumpSuit={handleSetTrumpSuit}
        onSendMessage={handleSendMessage}
      />
    );
  }

  return (
    <GameTable 
      gameState={gameState} 
      socketId={socket.id || ''} 
      onPlayCard={handlePlayCard}
      onPause={handlePause}
      onReset={handleReset}
      onSendMessage={handleSendMessage}
    />
  );
}


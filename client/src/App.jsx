import React from 'react';
import { GameProvider, useGame } from './context/GameContext';
import Lobby from './components/Lobby';
import Game from './components/Game';
import Scoring from './components/Scoring';

function AppInner() {
  const { gameState, gameCode } = useGame();

  if (!gameCode || !gameState) return <Lobby />;
  if (gameState.phase === 'lobby') return <Lobby />;
  if (gameState.phase === 'done') return <Scoring />;
  return <Game />;
}

export default function App() {
  return (
    <GameProvider>
      <AppInner />
    </GameProvider>
  );
}

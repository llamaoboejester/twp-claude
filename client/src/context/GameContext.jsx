import React, { createContext, useContext, useEffect, useReducer, useCallback } from 'react';
import { socket } from '../socket';

const GameContext = createContext(null);

const initialState = {
  connected: false,
  gameCode: null,
  playerId: null,
  playerName: null,
  gameState: null,
  error: null,
  pendingRequest: false,
};

function reducer(state, action) {
  switch (action.type) {
    case 'SET_CONNECTED':    return { ...state, connected: action.value };
    case 'SET_ERROR':        return { ...state, error: action.value, pendingRequest: false };
    case 'CLEAR_ERROR':      return { ...state, error: null };
    case 'SET_PENDING':      return { ...state, pendingRequest: action.value };
    case 'JOINED_GAME':
      return { ...state, gameCode: action.gameCode, playerId: action.playerId,
               playerName: action.playerName, error: null, pendingRequest: false };
    case 'GAME_STATE':       return { ...state, gameState: action.state, pendingRequest: false };
    case 'LEFT_GAME':        return { ...initialState, connected: state.connected };
    default: return state;
  }
}

export function GameProvider({ children }) {
  const [state, dispatch] = useReducer(reducer, initialState);

  useEffect(() => {
    socket.on('connect',    () => dispatch({ type: 'SET_CONNECTED', value: true }));
    socket.on('disconnect', () => dispatch({ type: 'SET_CONNECTED', value: false }));
    socket.on('game_state', gs => dispatch({ type: 'GAME_STATE', state: gs }));

    socket.connect();

    // Attempt reconnect from session storage
    const saved = sessionStorage.getItem('twp_session');
    if (saved) {
      try {
        const { gameCode, playerId } = JSON.parse(saved);
        socket.emit('reconnect_game', { gameCode, playerId }, res => {
          if (res.success) {
            dispatch({ type: 'JOINED_GAME', gameCode: res.gameCode, playerId: res.playerId,
                       playerName: res.playerName });
          } else {
            sessionStorage.removeItem('twp_session');
          }
        });
      } catch {}
    }

    return () => {
      socket.off('connect');
      socket.off('disconnect');
      socket.off('game_state');
    };
  }, []);

  const createGame = useCallback((playerName, modules) => {
    dispatch({ type: 'SET_PENDING', value: true });
    socket.emit('create_game', { playerName, modules }, res => {
      if (res.success) {
        sessionStorage.setItem('twp_session', JSON.stringify({ gameCode: res.gameCode, playerId: res.playerId }));
        dispatch({ type: 'JOINED_GAME', gameCode: res.gameCode, playerId: res.playerId, playerName });
      } else {
        dispatch({ type: 'SET_ERROR', value: res.error });
      }
    });
  }, []);

  const joinGame = useCallback((gameCode, playerName) => {
    dispatch({ type: 'SET_PENDING', value: true });
    socket.emit('join_game', { gameCode, playerName }, res => {
      if (res.success) {
        sessionStorage.setItem('twp_session', JSON.stringify({ gameCode: res.gameCode, playerId: res.playerId }));
        dispatch({ type: 'JOINED_GAME', gameCode: res.gameCode, playerId: res.playerId, playerName });
      } else {
        dispatch({ type: 'SET_ERROR', value: res.error });
      }
    });
  }, []);

  const startGame = useCallback(() => {
    socket.emit('start_game', {}, res => {
      if (!res.success) dispatch({ type: 'SET_ERROR', value: res.error });
    });
  }, []);

  const sendAction = useCallback((action) => {
    dispatch({ type: 'SET_PENDING', value: true });
    socket.emit('game_action', action, res => {
      if (res && !res.success) dispatch({ type: 'SET_ERROR', value: res.error });
    });
  }, []);

  const clearError = useCallback(() => dispatch({ type: 'CLEAR_ERROR' }), []);

  const myPlayer = state.gameState?.players?.[state.playerId] || null;
  const isMyTurn = state.gameState?.phase === 'playing' &&
    state.gameState.playerOrder[state.gameState.currentPlayerIndex] === state.playerId;
  const isCheckinActive = state.gameState?.phase === 'checkin';
  const isMyCheckinTurn = isCheckinActive &&
    state.gameState.checkinState?.pendingPlayers?.includes(state.playerId);

  return (
    <GameContext.Provider value={{
      ...state,
      myPlayer,
      isMyTurn,
      isCheckinActive,
      isMyCheckinTurn,
      createGame,
      joinGame,
      startGame,
      sendAction,
      clearError,
    }}>
      {children}
    </GameContext.Provider>
  );
}

export function useGame() {
  return useContext(GameContext);
}

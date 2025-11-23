
import { create } from 'zustand';
import { ISLANDS, ROUTES, GAME_EVENTS } from '../constants';
import { Player, Island, Phase, WeatherType, FloatingText, GameEventData } from '../types';

interface GameState {
  phase: Phase;
  weather: WeatherType;
  turnIndex: number;
  currentDay: number; // 1 to 31 (August)
  maxDays: number;
  
  // Dice State
  diceValue: number;
  isDiceRolling: boolean;
  
  players: Player[];
  islands: Island[];
  message: string | null;
  
  // Event Deck System
  eventQueue: GameEventData[];
  currentEvent: GameEventData | null;
  
  floatingTexts: FloatingText[];
  
  // Movement State
  remainingSteps: number;
  validNextMoves: string[]; // Island IDs
  previousIslandId: string | null;
  moveStartTime: number | null; // For syncing camera and boat

  // Actions
  addPlayer: () => void;
  removePlayer: (id: string) => void;
  updatePlayerName: (id: string, name: string) => void;
  updatePlayerAvatar: (id: string, color: string) => void;
  rollDice: () => void;
  payBail: () => void;
  chooseDirection: (targetId: string) => void;
  buyProperty: () => void;
  upgradeProperty: () => void;
  skipTurn: () => void;
  endTurn: () => void;
  triggerEvent: () => void;
  dismissEvent: () => void;
  initializeGame: () => void;
  
  // Visuals
  addFloatingText: (text: string, position: [number, number, number], color: string) => void;
  removeFloatingText: (id: string) => void;

  // Internal helpers
  processMovementStep: () => void;
  performMove: (targetId: string) => void;
  handleLanding: () => void;
  checkGameOver: () => void;
  shuffleDeck: () => void;
  updateWeather: () => void;
}

const INITIAL_PLAYERS: Player[] = [
  { id: 'p1', name: 'Kamaki', avatarColor: '#ef4444', positionId: 'piraeus', travelDestinationId: null, money: 1000, properties: [], isJailed: false, jailReason: null },
  { id: 'p2', name: 'Tourist', avatarColor: '#3b82f6', positionId: 'piraeus', travelDestinationId: null, money: 1000, properties: [], isJailed: false, jailReason: null },
];

export const useGameStore = create<GameState>((set, get) => ({
  phase: 'LOBBY',
  weather: 'CLEAR',
  turnIndex: 0,
  currentDay: 1,
  maxDays: 31,
  diceValue: 1,
  isDiceRolling: false,
  players: INITIAL_PLAYERS,
  islands: ISLANDS,
  message: "Welcome to the Aegean! Press Start.",
  
  eventQueue: [],
  currentEvent: null,
  
  floatingTexts: [],
  
  remainingSteps: 0,
  validNextMoves: [],
  previousIslandId: null,
  moveStartTime: null,

  addPlayer: () => {
      const { players } = get();
      if (players.length >= 4) return;
      
      const newId = `p${players.length + 1}`;
      const newPlayer: Player = {
          id: newId,
          name: `Player ${players.length + 1}`,
          avatarColor: ['#1f2937', '#65a30d', '#f3f4f6'][players.length - 2] || '#000000',
          positionId: 'piraeus',
          travelDestinationId: null,
          money: 1000,
          properties: [],
          isJailed: false,
          jailReason: null
      };
      set({ players: [...players, newPlayer] });
  },

  removePlayer: (id: string) => {
      const { players } = get();
      if (players.length <= 2) return;
      set({ players: players.filter(p => p.id !== id) });
  },

  updatePlayerName: (id, name) => {
    set(state => ({
      players: state.players.map(p => p.id === id ? { ...p, name } : p)
    }));
  },

  updatePlayerAvatar: (id, color) => {
    set(state => ({
      players: state.players.map(p => p.id === id ? { ...p, avatarColor: color } : p)
    }));
  },

  shuffleDeck: () => {
    const deck = [...GAME_EVENTS];
    for (let i = deck.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [deck[i], deck[j]] = [deck[j], deck[i]];
    }
    set({ eventQueue: deck });
  },

  initializeGame: () => {
    get().shuffleDeck();
    set({ phase: 'ROLLING', message: `August 1st. ${get().players[0].name}'s turn!` });
  },

  rollDice: () => {
    const { phase, isDiceRolling, players, turnIndex, weather } = get();
    if (phase !== 'ROLLING' || isDiceRolling) return;

    const currentPlayer = players[turnIndex];

    if (currentPlayer.isJailed) {
        set({ isDiceRolling: true, message: currentPlayer.jailReason === 'STRIKE' ? "Trying to find a scab boat..." : "Trying to escape traffic..." });
        
        const roll = Math.floor(Math.random() * 6) + 1;
        set({ diceValue: roll });

        setTimeout(() => {
            set({ isDiceRolling: false });
            if (roll === 6) {
                const newPlayers = [...players];
                newPlayers[turnIndex].isJailed = false;
                newPlayers[turnIndex].jailReason = null;
                set({ 
                    players: newPlayers, 
                    message: "Rolled a 6! You're free!", 
                    remainingSteps: roll, 
                    phase: 'MOVING' 
                });
                get().processMovementStep();
            } else {
                set({ message: `Rolled ${roll}. Still stuck.` });
                setTimeout(() => get().endTurn(), 2000);
            }
        }, 1500);
        return;
    }

    const rawRoll = Math.floor(Math.random() * 6) + 1;
    let effectiveRoll = rawRoll;
    let weatherMsg = "";
    
    if (weather === 'MELTEMI') {
        effectiveRoll = Math.ceil(rawRoll / 2);
        weatherMsg = " (Meltemi: Half Speed)";
    }

    set({ isDiceRolling: true, diceValue: rawRoll, message: "Rolling..." });

    setTimeout(() => {
      set({ 
        isDiceRolling: false,
        message: `Rolled a ${rawRoll}${weatherMsg}!`,
        remainingSteps: effectiveRoll, 
        previousIslandId: null, 
        phase: 'MOVING' 
      });
      get().processMovementStep();
    }, 1500);
  },

  payBail: () => {
      const { players, turnIndex } = get();
      const currentPlayer = players[turnIndex];
      const BAIL_COST = 50;
      
      if (currentPlayer.money >= BAIL_COST) {
          const newPlayers = [...players];
          newPlayers[turnIndex].money -= BAIL_COST;
          newPlayers[turnIndex].isJailed = false;
          newPlayers[turnIndex].jailReason = null;
          
          const currentPosId = players[turnIndex].positionId;
          const currentIsland = get().islands.find(i => i.id === currentPosId);
          if (currentIsland) {
              get().addFloatingText(`-${BAIL_COST}€`, currentIsland.position, '#ef4444');
          }

          set({ players: newPlayers, message: "Paid 50€ bribe. You are free." });
          get().rollDice();
      } else {
          set({ message: "Not enough money to pay!" });
      }
  },

  processMovementStep: () => {
    const { remainingSteps, players, turnIndex, previousIslandId } = get();
    
    if (remainingSteps <= 0) {
      get().handleLanding();
      return;
    }

    const currentPlayer = players[turnIndex];
    const currentId = currentPlayer.positionId;

    const connections = ROUTES.filter(r => r.from === currentId || r.to === currentId);
    const neighbors = connections.map(r => r.from === currentId ? r.to : r.from);

    const forwardNeighbors = neighbors.filter(id => id !== previousIslandId);
    const validMoves = forwardNeighbors.length > 0 ? forwardNeighbors : neighbors;

    if (validMoves.length === 0) {
      get().handleLanding();
      return;
    }

    if (validMoves.length === 1) {
      get().performMove(validMoves[0]);
    } else {
      set({ 
        phase: 'CHOOSING_PATH', 
        validNextMoves: validMoves,
        message: "Choose your route!" 
      });
    }
  },

  chooseDirection: (targetId: string) => {
    if (get().phase !== 'CHOOSING_PATH') return;
    if (!get().validNextMoves.includes(targetId)) return;

    get().performMove(targetId);
  },

  performMove: (targetId: string) => {
    const { players, turnIndex } = get();
    const currentId = players[turnIndex].positionId;

    const movingPlayers = [...players];
    movingPlayers[turnIndex].travelDestinationId = targetId;
    
    set({ 
        players: movingPlayers,
        phase: 'MOVING', 
        validNextMoves: [], 
        message: null,
        moveStartTime: Date.now() // Start camera/boat sync
    });

    // Increased travel time to 3000ms for larger map
    setTimeout(() => {
        const arrivedPlayers = [...get().players];
        arrivedPlayers[turnIndex].positionId = targetId;
        arrivedPlayers[turnIndex].travelDestinationId = null;
        
        set({ 
            players: arrivedPlayers, 
            remainingSteps: get().remainingSteps - 1,
            previousIslandId: currentId,
            moveStartTime: null
        });
        
        get().processMovementStep();
    }, 3000); 
  },

  handleLanding: () => {
    const { players, turnIndex, islands } = get();
    const currentPlayer = players[turnIndex];
    const landedIsland = islands.find(i => i.id === currentPlayer.positionId);

    if (!landedIsland) return;

    if (landedIsland.type === 'EVENT') {
        get().triggerEvent();
    } else if (landedIsland.ownerId && landedIsland.ownerId !== currentPlayer.id) {
        const owner = players.find(p => p.id === landedIsland.ownerId);
        const multiplier = Math.pow(1.5, landedIsland.level - 1);
        const rent = Math.floor(landedIsland.rent * multiplier);
        
        const newPlayers = [...get().players];
        newPlayers[turnIndex].money -= rent;
        get().addFloatingText(`-${rent}€`, landedIsland.position, '#ef4444');

        const ownerIndex = newPlayers.findIndex(p => p.id === landedIsland.ownerId);
        if (ownerIndex > -1) {
            newPlayers[ownerIndex].money += rent;
            get().addFloatingText(`+${rent}€`, [landedIsland.position[0], landedIsland.position[1]+1, landedIsland.position[2]], '#22c55e');
        }

        set({ 
            players: newPlayers, 
            phase: 'ACTION', 
            message: `Paid ${rent}€ rent to ${owner?.name}.`
        });
        get().checkGameOver();
        setTimeout(() => get().endTurn(), 3000);

    } else if (landedIsland.ownerId === currentPlayer.id) {
        set({ phase: 'ACTION', message: `Welcome back to ${landedIsland.name}. Upgrade?` });
    } else if (!landedIsland.ownerId && landedIsland.type === 'ISLAND') {
        set({ phase: 'ACTION', message: `Landed on ${landedIsland.name}.` });
    } else {
        set({ phase: 'ACTION', message: `Relaxing at ${landedIsland.name}.` });
        setTimeout(() => get().endTurn(), 2000);
    }
  },

  buyProperty: () => {
    const { players, turnIndex, islands } = get();
    const player = players[turnIndex];
    const islandIndex = islands.findIndex(i => i.id === player.positionId);
    if (islandIndex === -1) return;
    const island = islands[islandIndex];

    if (player.money >= island.price) {
      const newPlayers = [...players];
      newPlayers[turnIndex].money -= island.price;
      newPlayers[turnIndex].properties.push(island.id);
      const newIslands = [...islands];
      newIslands[islandIndex].ownerId = player.id;
      get().addFloatingText(`-${island.price}€`, island.position, '#ef4444');

      set({ 
        players: newPlayers, 
        islands: newIslands, 
        message: `Bought ${island.name}!`,
        phase: 'ACTION' 
      });
      setTimeout(() => get().endTurn(), 1500);
    } else {
      set({ message: "Not enough Euros!" });
    }
  },

  upgradeProperty: () => {
    const { players, turnIndex, islands } = get();
    const player = players[turnIndex];
    const islandIndex = islands.findIndex(i => i.id === player.positionId);
    if (islandIndex === -1) return;
    const island = islands[islandIndex];
    const upgradeCost = Math.floor(island.price * 0.5);

    if (island.level >= 4) {
        set({ message: "Max level reached!" });
        return;
    }

    if (player.money >= upgradeCost) {
      const newPlayers = [...players];
      newPlayers[turnIndex].money -= upgradeCost;
      const newIslands = [...islands];
      newIslands[islandIndex].level += 1;

      get().addFloatingText(`-${upgradeCost}€`, island.position, '#ef4444');
      get().addFloatingText(`UPGRADED!`, [island.position[0], island.position[1]+2, island.position[2]], '#fbbf24');

      set({ 
        players: newPlayers, 
        islands: newIslands, 
        message: `Upgraded ${island.name} to Level ${newIslands[islandIndex].level}!`,
        phase: 'ACTION' 
      });
      setTimeout(() => get().endTurn(), 1500);
    } else {
      set({ message: "Need more Euros to upgrade!" });
    }
  },

  skipTurn: () => {
    get().endTurn();
  },

  triggerEvent: () => {
    let { eventQueue } = get();
    if (eventQueue.length === 0) {
        get().shuffleDeck();
        eventQueue = get().eventQueue;
    }
    const event = eventQueue[0];
    const newQueue = eventQueue.slice(1);
    const currentPlayer = get().players[get().turnIndex];
    const currentIsland = get().islands.find(i => i.id === currentPlayer.positionId);
    const pos = currentIsland ? currentIsland.position : [0,0,0] as [number,number,number];
    
    set({ phase: 'EVENT', currentEvent: event, eventQueue: newQueue });

    const newPlayers = [...get().players];
    const playerIndex = get().turnIndex;

    if (event.effectType === 'MONEY') {
        if (event.target === 'ALL_OTHERS' && event.value > 0) {
            newPlayers.forEach((p, idx) => {
                if (idx !== playerIndex) {
                    p.money -= event.value;
                    const pIsland = get().islands.find(i => i.id === p.positionId);
                    if (pIsland) get().addFloatingText(`-${event.value}€`, pIsland.position, '#ef4444');
                } else {
                    p.money += event.value * (newPlayers.length - 1);
                    get().addFloatingText(`+${event.value * (newPlayers.length - 1)}€`, pos, '#22c55e');
                }
            });
        } else {
            newPlayers[playerIndex].money += event.value;
            const color = event.value >= 0 ? '#22c55e' : '#ef4444';
            const sign = event.value >= 0 ? '+' : '';
            get().addFloatingText(`${sign}${event.value}€`, pos, color);
        }
    } 
    else if (event.effectType === 'JAIL') {
        newPlayers[playerIndex].isJailed = true;
        newPlayers[playerIndex].jailReason = event.title.includes("Strike") ? 'STRIKE' : 'TRAFFIC';
    } 
    else if (event.effectType === 'WEATHER') {
        set({ weather: 'MELTEMI' });
    }

    set({ players: newPlayers });
  },
  
  dismissEvent: () => {
      const { weather, currentEvent } = get();
      set({ currentEvent: null });
      if (currentEvent?.effectType === 'WEATHER' && weather === 'MELTEMI') {
           // Allow natural weather cycle to clear it next day, or clear after timeout
      }
      get().checkGameOver();
      get().endTurn();
  },

  updateWeather: () => {
      // Natural weather progression
      const { currentDay, weather } = get();
      const rand = Math.random();
      
      // Mid-August (days 10-20) has higher chance of Meltemi
      let meltemiChance = 0.2;
      if (currentDay >= 10 && currentDay <= 20) meltemiChance = 0.5;
      
      let newWeather: WeatherType = 'CLEAR';
      
      // If currently Meltemi, 60% chance to stay Meltemi
      if (weather === 'MELTEMI') {
          newWeather = rand < 0.6 ? 'MELTEMI' : 'CLEAR';
      } else {
          newWeather = rand < meltemiChance ? 'MELTEMI' : 'CLEAR';
      }
      
      // 5% chance of Heatwave regardless
      if (Math.random() < 0.05) newWeather = 'HEATWAVE';

      if (newWeather !== weather) {
          set({ weather: newWeather });
      }
  },

  endTurn: () => {
    if (get().phase === 'GAME_OVER') return;

    const { turnIndex, players, currentDay, maxDays } = get();
    let nextDay = currentDay;
    
    const nextIndex = (turnIndex + 1) % players.length;
    
    if (nextIndex === 0) {
        nextDay += 1;
        get().updateWeather(); // New day, new weather check
        
        if (nextDay > maxDays) {
            set({ 
                phase: 'GAME_OVER', 
                message: "Summer is over! Who has the most Euros?" 
            });
            return;
        }
    }
    
    set({ 
      turnIndex: nextIndex, 
      currentDay: nextDay,
      phase: 'ROLLING', 
      diceValue: 1,
      isDiceRolling: false,
      remainingSteps: 0,
      validNextMoves: [],
      message: `${players[nextIndex].name}'s turn to roll.`
    });
  },

  checkGameOver: () => {
      const { players } = get();
      const bankruptPlayer = players.find(p => p.money < 0);
      if (bankruptPlayer) {
          set({ 
              phase: 'GAME_OVER', 
              message: `GAME OVER! ${bankruptPlayer.name} went bankrupt!` 
          });
      }
  },

  addFloatingText: (text, position, color) => {
      const newText: FloatingText = {
          id: Math.random().toString(36).substr(2, 9),
          text,
          position,
          color,
          createdAt: Date.now()
      };
      set(state => ({ floatingTexts: [...state.floatingTexts, newText] }));
  },

  removeFloatingText: (id) => {
      set(state => ({ floatingTexts: state.floatingTexts.filter(ft => ft.id !== id) }));
  }
}));

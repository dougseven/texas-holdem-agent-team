// ============================================================================
// NPC Persona Engine — Texas Hold'em Persona Edition
// ES Module — No external dependencies beyond fetch()
// ============================================================================

// ---------------------------------------------------------------------------
// 1. PERSONA DEFINITIONS
// ---------------------------------------------------------------------------
const PERSONAS = [
  {
    id: 'calling-station',
    name: 'Barnacle Bill',
    archetype: 'Calling Station',
    vpip: 55,
    pfr: 4,
    description: 'The Stubborn Amateur. Hates folding, always wants to see cards.',
    playstyle: 'High VPIP, Low PFR. Calls three streets with bottom pair to keep you honest. Rarely raises.',
    weakness: 'Never bluff him. Only value-bet strong hands.',
    chatFrequency: 0.15,
    chatStyle: 'friendly, oblivious, hopeful',
  },
  {
    id: 'whale',
    name: 'Mr. Moneybags',
    archetype: 'Whale',
    vpip: 85,
    pfr: 30,
    description: 'The Rich Gambler. Chips are points, not money.',
    playstyle: 'Plays almost every hand. Chases draws regardless of odds. Makes massive over-bets when excited.',
    weakness: 'Isolate him and let him bet into your monsters.',
    chatFrequency: 0.25,
    chatStyle: 'flashy, loud, braggy',
  },
  {
    id: 'superstitious',
    name: 'Lucky Larry',
    archetype: 'Superstitious',
    vpip: 40,
    pfr: 10,
    description: 'The Gut-Feeling Player. Believes in hot streaks and lucky seats.',
    playstyle: 'Unpredictable. Might fold Kings on a bad feeling or shove with J-4 suited because Jacks are lucky today.',
    weakness: 'After winning a pot he plays the next 4 hands aggressively. Tightens up after losses.',
    chatFrequency: 0.20,
    chatStyle: 'superstitious, excited, mystical',
  },
  {
    id: 'rock',
    name: 'Earl',
    archetype: 'Old Coffee Rock',
    vpip: 6,
    pfr: 4,
    description: 'The Grumpy Veteran. Plays top 5% of hands only.',
    playstyle: 'Extremely tight. If he raises, he has the nuts. If he checks, he missed.',
    weakness: 'Steal his blinds relentlessly. If he raises back, fold unless you have a monster.',
    chatFrequency: 0.03,
    chatStyle: 'grumpy, terse, complaining about young players',
  },
  {
    id: 'nit',
    name: 'Scaredy Cat Sarah',
    archetype: 'Nit',
    vpip: 12,
    pfr: 6,
    description: 'The Risk-Averse. Terrified of losing her stack.',
    playstyle: 'Folds to any aggression. Even with top pair, assumes you have a set if you raise the turn.',
    weakness: 'Bet at her every street. She folds everything but the absolute nuts.',
    chatFrequency: 0.08,
    chatStyle: 'nervous, apologetic, uncertain',
  },
  {
    id: 'set-miner',
    name: 'Trapper Tom',
    archetype: 'Set-Miner',
    vpip: 8,
    pfr: 2,
    description: 'The One-Trick Pony. Only plays pocket pairs hunting for sets.',
    playstyle: 'Plays pocket pairs exclusively. Folds if no set on flop. Check-calls when he hits.',
    weakness: 'If board is disconnected and he wakes up with a raise, he has the set.',
    chatFrequency: 0.05,
    chatStyle: 'quiet, patient, cryptic',
  },
  {
    id: 'maniac',
    name: 'Psycho Sid',
    archetype: 'Maniac',
    vpip: 75,
    pfr: 60,
    description: 'The Agent of Chaos. Raises with any two cards.',
    playstyle: 'Raises pre-flop constantly. C-bets 100%. Shoves all-in as a bluff frequently.',
    weakness: 'Wait for a decent hand, check to him, let him bluff off his stack.',
    chatFrequency: 0.50,
    chatStyle: 'aggressive, taunting, trash-talking',
  },
  {
    id: 'bully',
    name: 'Big Stack Ben',
    archetype: 'Bully',
    vpip: 35,
    pfr: 28,
    description: 'The Chip Leader. Uses stack size as a weapon.',
    playstyle: 'Puts shorter stacks all-in. Preys on players trying to survive.',
    weakness: 'Trap him. He expects you to fold. Limp with Aces and let him shove.',
    chatFrequency: 0.18,
    chatStyle: 'dominant, intimidating, confident',
  },
  {
    id: 'lag-pro',
    name: 'Internet Kid',
    archetype: 'LAG Pro',
    vpip: 28,
    pfr: 24,
    description: 'The Modern Online Grinder. Calculated aggression.',
    playstyle: 'Wide range but balanced. Knows how to mix bluffs with value. Very dangerous.',
    weakness: 'Unpredictability. Make illogical plays to break his math.',
    chatFrequency: 0.05,
    chatStyle: 'cool, analytical, brief',
  },
  {
    id: 'math-whiz',
    name: 'Calculator Cal',
    archetype: 'Math Whiz',
    vpip: 24,
    pfr: 20,
    description: 'The GTO Bot. Thinks in probabilities and pot odds.',
    playstyle: 'Balanced and tight. Rarely makes mistakes. Bets aggressively when math supports it.',
    weakness: 'Random sizing or illogical moves mess up his pot-odds calculations.',
    chatFrequency: 0.03,
    chatStyle: 'robotic, precise, statistical',
  },
  {
    id: 'sheriff',
    name: 'Officer Dan',
    archetype: 'Sheriff',
    vpip: 22,
    pfr: 16,
    description: 'The Bluff Catcher. Hates being bluffed.',
    playstyle: 'Solid cards. Makes light calls on the river to see your cards.',
    weakness: 'Value bet thin. He will look you up with worse.',
    chatFrequency: 0.12,
    chatStyle: 'skeptical, challenging, probing',
  },
  {
    id: 'tilter',
    name: 'Angry Andy',
    archetype: 'Tilter',
    vpip: 20,
    pfr: 16,
    description: 'The Emotional Rollercoaster. Fine when winning, disaster when losing.',
    playstyle: 'Normal until a bad beat. Then goes full tilt: shoves all-in with garbage.',
    weakness: 'Beat him in a pot and watch him self-destruct.',
    chatFrequency: 0.22,
    chatStyle: 'volatile, angry when losing, smug when winning',
  },
  {
    id: 'speech-player',
    name: 'Chatty Cathy',
    archetype: 'Speech Player',
    vpip: 30,
    pfr: 18,
    description: 'The Information Fisher. Never stops talking.',
    playstyle: 'Uses speech to get reactions. Actual card play is mediocre.',
    weakness: 'Ignore the chatter. Her play is average.',
    chatFrequency: 0.50,
    chatStyle: 'talkative, probing, dramatic',
  },
  {
    id: 'mirror',
    name: 'Copycat Carl',
    archetype: 'Mirror',
    vpip: 25,
    pfr: 18,
    description: 'The Chameleon. Mirrors the player to his right.',
    playstyle: 'Adapts to table speed. Mimics the VPIP/PFR of the player on his right.',
    weakness: 'Change gears. Switch from tight to loose and he cannot adjust fast enough.',
    chatFrequency: 0.10,
    chatStyle: 'adaptive, echoing, agreeable',
  },
  {
    id: 'newbie',
    name: 'First Timer Fiona',
    archetype: 'Newbie',
    vpip: 45,
    pfr: 2,
    description: 'The Confused Beginner. Completely random due to ignorance.',
    playstyle: 'Random play. Might slow-play Aces accidentally. Bet sizing reveals hand strength.',
    weakness: 'Newbies bet small when weak, big when strong.',
    chatFrequency: 0.30,
    chatStyle: 'confused, asking questions, apologetic',
  },
];

// ---------------------------------------------------------------------------
// 2. RANDOM DISPLAY NAME POOL
// ---------------------------------------------------------------------------
const DISPLAY_NAME_POOL = [
  'Alex', 'Jordan', 'Sam', 'Casey', 'Morgan', 'Riley', 'Taylor', 'Quinn',
  'Avery', 'Dakota', 'Reese', 'Charlie', 'Skyler', 'Jamie', 'Rowan',
  'Hayden', 'Parker', 'Drew', 'Sage', 'Blake', 'Peyton', 'Finley',
  'Cameron', 'Kendall', 'Emerson', 'Kai', 'Phoenix', 'River', 'Lennox',
  'Shiloh', 'Remy', 'Dallas', 'Milan', 'Nico', 'Harper',
];

// ---------------------------------------------------------------------------
// 3. PRE-FLOP HAND STRENGTH TABLE (simplified Chen-inspired)
// ---------------------------------------------------------------------------
const PREMIUM_HANDS = new Set([
  'AA', 'KK', 'QQ', 'JJ', 'AKs', 'AKo',
]);
const STRONG_HANDS = new Set([
  'TT', '99', 'AQs', 'AJs', 'KQs',
]);
const MEDIUM_HANDS = new Set([
  '88', '77', 'ATs', 'AJo', 'KJs', 'QJs',
]);
const SPECULATIVE_HANDS = new Set([
  '66', '55', 'A9s', 'KQo', 'JTs',
]);

function cardKey(card) {
  return card.rank;
}

function handKey(c1, c2) {
  const ranks = '23456789TJQKA';
  const r1 = ranks.indexOf(c1.rank);
  const r2 = ranks.indexOf(c2.rank);
  const high = r1 >= r2 ? c1 : c2;
  const low = r1 >= r2 ? c2 : c1;
  const suited = c1.suit === c2.suit;
  if (high.rank === low.rank) return high.rank + low.rank;
  return high.rank + low.rank + (suited ? 's' : 'o');
}

function estimatePreFlopStrength(holeCards) {
  if (!holeCards || holeCards.length < 2) return 30;
  const key = handKey(holeCards[0], holeCards[1]);
  if (PREMIUM_HANDS.has(key)) return 90;
  if (STRONG_HANDS.has(key)) return 75;
  if (MEDIUM_HANDS.has(key)) return 58;
  if (SPECULATIVE_HANDS.has(key)) return 42;
  // Suited connectors / suited aces get a small bump
  const suited = holeCards[0].suit === holeCards[1].suit;
  const ranks = '23456789TJQKA';
  const r1 = ranks.indexOf(holeCards[0].rank);
  const r2 = ranks.indexOf(holeCards[1].rank);
  const gap = Math.abs(r1 - r2);
  if (suited && gap <= 2 && Math.max(r1, r2) >= 7) return 38;
  if (suited && Math.max(r1, r2) >= 10) return 32;
  if (Math.max(r1, r2) <= 4 && gap >= 3) return 10; // trash
  return 25;
}

// ---------------------------------------------------------------------------
// 4. UTILITY HELPERS
// ---------------------------------------------------------------------------
function shuffleArray(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function clamp(val, min, max) {
  return Math.max(min, Math.min(max, val));
}

function formatCards(cards) {
  if (!cards || cards.length === 0) return 'none';
  return cards.map((c) => c.rank + c.suit).join(' ');
}

// ---------------------------------------------------------------------------
// 5. NPC ENGINE CLASS
// ---------------------------------------------------------------------------
class NPCEngine {
  /**
   * @param {Object} config
   * @param {string} config.geminiApiKey - Google Generative Language API key
   * @param {string} [config.projectId] - Optional project identifier
   */
  constructor(config = {}) {
    this._apiKey = config.geminiApiKey || '';
    this._projectId = config.projectId || null;
    this._apiEndpoint =
      'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent';

    // Seat → assigned NPC data
    this._seats = new Map(); // seatIndex → { persona, displayName, tiltState, tiltCounter, sessionLog, startingStack }

    // Event listeners
    this._listeners = new Map(); // event → Set<callback>

    // Observed stats for Copycat Carl
    this._observedStats = new Map(); // seatIndex → { hands: number, vpipCount: number, pfrCount: number }
  }

  // -------------------------------------------------------------------------
  // PUBLIC API: assignPersonas
  // -------------------------------------------------------------------------
  assignPersonas(seats) {
    const selected = shuffleArray(PERSONAS).slice(0, 9);
    const names = shuffleArray(DISPLAY_NAME_POOL).slice(0, 9);
    const result = new Map();

    seats.forEach((seatIndex, i) => {
      const persona = selected[i];
      const displayName = names[i];
      this._seats.set(seatIndex, {
        persona,
        displayName,
        tiltState: 'normal', // 'normal' | 'tilted' | 'confident'
        tiltCounter: 0,      // countdown for temporary states
        sessionLog: [],       // last 10 actions
        startingStack: null,  // set on first action for tilt tracking
      });
      result.set(seatIndex, { personaId: persona.id, displayName });
    });

    return result;
  }

  // -------------------------------------------------------------------------
  // PUBLIC API: getAction
  // -------------------------------------------------------------------------
  async getAction(seatIndex, gameState, holeCards) {
    const seatData = this._seats.get(seatIndex);
    if (!seatData) {
      return { action: 'fold' };
    }

    const persona = seatData.persona;
    const effectiveStats = this._getEffectiveStats(seatIndex, seatData);

    // Track starting stack for tilt calculations
    if (seatData.startingStack === null) {
      const player = this._findPlayer(seatIndex, gameState);
      if (player) seatData.startingStack = player.chips + (player.currentBet || 0);
    }

    // Decrement tilt/confident counter
    if (seatData.tiltCounter > 0) {
      seatData.tiltCounter--;
      if (seatData.tiltCounter <= 0 && seatData.tiltState !== 'normal') {
        // Lucky Larry returns to normal after 4 hands of confidence
        if (seatData.persona.id !== 'tilter') {
          seatData.tiltState = 'normal';
        }
      }
    }

    // --- PRE-FLOP FAST-FOLD OPTIMIZATION ---
    const street = gameState.communityCards && gameState.communityCards.length > 0
      ? 'postflop'
      : 'preflop';

    if (street === 'preflop') {
      const strength = estimatePreFlopStrength(holeCards);
      if (strength < 15 && Math.random() * 100 > effectiveStats.vpip) {
        const action = this._canCheck(seatIndex, gameState) ? 'check' : 'fold';
        const result = { action };
        this._logAction(seatIndex, result, gameState);
        return result;
      }
    }

    // --- GEMINI API CALL ---
    this._emit('thinking', { seatIndex });

    let result;
    try {
      result = await this._callGemini(seatIndex, seatData, effectiveStats, gameState, holeCards);
    } catch (err) {
      // Fallback to local logic on any API error
      result = this._localFallback(seatIndex, effectiveStats, gameState, holeCards);
    }

    // Validate and sanitize
    result = this._validateAction(result, seatIndex, gameState);

    // Attach chat possibility
    if (!result.chat && Math.random() < persona.chatFrequency * 0.3) {
      // Small chance of spontaneous chat with action
      result.chat = null; // Only through explicit getChat or Gemini response
    }

    this._logAction(seatIndex, result, gameState);
    this._emit('actionReady', { seatIndex, action: result });

    return result;
  }

  // -------------------------------------------------------------------------
  // PUBLIC API: getChat
  // -------------------------------------------------------------------------
  async getChat(seatIndex, event, gameState) {
    const seatData = this._seats.get(seatIndex);
    if (!seatData) return null;

    // Respect chat frequency weighting
    if (Math.random() > seatData.persona.chatFrequency) {
      return null;
    }

    const persona = seatData.persona;
    const prompt = `You are ${persona.name}, a poker player. Style: ${persona.chatStyle}. ` +
      `Event: ${event}. Pot: ${gameState.pot || 0}. ` +
      `Say something brief (under 15 words) in character, or say nothing. ` +
      `Respond with ONLY the chat text or the word "null" if you choose silence.`;

    try {
      const response = await this._fetchGemini(prompt, '');
      const text = response.trim();
      if (!text || text.toLowerCase() === 'null') return null;
      return text.replace(/^["']|["']$/g, ''); // strip wrapping quotes
    } catch {
      return this._localChat(persona, event);
    }
  }

  // -------------------------------------------------------------------------
  // PUBLIC API: getPersonaHint
  // -------------------------------------------------------------------------
  getPersonaHint(_seatIndex) {
    return null;
  }

  // -------------------------------------------------------------------------
  // PUBLIC API: on (event emitter)
  // -------------------------------------------------------------------------
  on(event, callback) {
    if (!this._listeners.has(event)) {
      this._listeners.set(event, new Set());
    }
    this._listeners.get(event).add(callback);
  }

  // -------------------------------------------------------------------------
  // PUBLIC API: updateObservedStats — for Copycat Carl tracking
  // -------------------------------------------------------------------------
  updateObservedStats(seatIndex, didVPIP, didPFR) {
    if (!this._observedStats.has(seatIndex)) {
      this._observedStats.set(seatIndex, { hands: 0, vpipCount: 0, pfrCount: 0 });
    }
    const stats = this._observedStats.get(seatIndex);
    stats.hands++;
    if (didVPIP) stats.vpipCount++;
    if (didPFR) stats.pfrCount++;
  }

  // -------------------------------------------------------------------------
  // PUBLIC API: notifyHandResult — for tilt/confidence state tracking
  // -------------------------------------------------------------------------
  notifyHandResult(seatIndex, potWon, potLost) {
    const seatData = this._seats.get(seatIndex);
    if (!seatData) return;

    const persona = seatData.persona;

    // Angry Andy tilt logic
    if (persona.id === 'tilter' && potLost > 0) {
      const stack = seatData.startingStack || 5000;
      if (potLost > stack * 0.2) {
        seatData.tiltState = 'tilted';
        seatData.tiltCounter = 8; // stays tilted for ~8 hands
      }
    }

    // Angry Andy recovery
    if (persona.id === 'tilter' && seatData.tiltState === 'tilted' && potWon > 0) {
      seatData.tiltCounter = Math.max(0, seatData.tiltCounter - 3);
      if (seatData.tiltCounter <= 0) seatData.tiltState = 'normal';
    }

    // Lucky Larry confidence
    if (persona.id === 'superstitious' && potWon > 0) {
      seatData.tiltState = 'confident';
      seatData.tiltCounter = 4;
    }
    if (persona.id === 'superstitious' && potLost > 0 && seatData.tiltState !== 'confident') {
      seatData.tiltState = 'normal';
    }
  }

  // =========================================================================
  // PRIVATE: Effective stats (handles Copycat Carl + tilt states)
  // =========================================================================
  _getEffectiveStats(seatIndex, seatData) {
    const persona = seatData.persona;
    let vpip = persona.vpip;
    let pfr = persona.pfr;

    // Copycat Carl: mirror player to the right
    if (persona.id === 'mirror') {
      const allSeats = [...this._seats.keys()].sort((a, b) => a - b);
      const idx = allSeats.indexOf(seatIndex);
      const rightSeat = idx > 0 ? allSeats[idx - 1] : allSeats[allSeats.length - 1];
      const observed = this._observedStats.get(rightSeat);
      if (observed && observed.hands >= 3) {
        vpip = Math.round((observed.vpipCount / observed.hands) * 100);
        pfr = Math.round((observed.pfrCount / observed.hands) * 100);
      }
    }

    // Angry Andy tilt override
    if (persona.id === 'tilter' && seatData.tiltState === 'tilted') {
      vpip = 90;
      pfr = 85;
    }

    // Lucky Larry confidence boost
    if (persona.id === 'superstitious' && seatData.tiltState === 'confident') {
      vpip = Math.min(vpip + 25, 80);
      pfr = Math.min(pfr + 20, 45);
    }

    return { vpip, pfr };
  }

  // =========================================================================
  // PRIVATE: Gemini API call
  // =========================================================================
  async _callGemini(seatIndex, seatData, effectiveStats, gameState, holeCards) {
    const persona = seatData.persona;
    const tiltNote = seatData.tiltState === 'tilted'
      ? 'You are ON TILT. You are furious and want to win your chips back NOW. Play extremely aggressively.'
      : seatData.tiltState === 'confident'
        ? 'You are feeling LUCKY and CONFIDENT. Play more hands and bet bigger.'
        : '';

    const systemPrompt =
      `You are ${persona.name}, a poker player with this style: ${persona.playstyle} ` +
      `Your stats: VPIP=${effectiveStats.vpip}%, PFR=${effectiveStats.pfr}%. ${tiltNote}`;

    const player = this._findPlayer(seatIndex, gameState);
    const myStack = player ? player.chips : 0;
    const myBet = player ? (player.currentBet || 0) : 0;
    const communityCards = formatCards(gameState.communityCards);
    const hole = formatCards(holeCards);
    const pot = gameState.pot || 0;
    const currentBet = gameState.currentBet || 0;
    const toCall = Math.max(0, currentBet - myBet);
    const minRaise = gameState.minRaise || (currentBet * 2) || (gameState.bigBlind * 2) || 100;
    const bigBlind = gameState.bigBlind || 50;

    // Build concise action history for this street
    const recentActions = (gameState.actionHistory || []).slice(-8)
      .map((a) => `Seat${a.seatIndex}: ${a.action}${a.amount ? ' ' + a.amount : ''}`)
      .join(', ');

    // Session log context
    const sessionContext = seatData.sessionLog.slice(-5)
      .map((l) => `${l.street}: ${l.action}${l.amount ? ' ' + l.amount : ''}`)
      .join('; ');

    const canCheck = toCall === 0;
    const availableActions = ['fold'];
    if (canCheck) availableActions.push('check');
    if (toCall > 0 && toCall <= myStack) availableActions.push('call');
    if (myStack > minRaise) availableActions.push('raise');
    if (myStack > 0) availableActions.push('allin');

    const userPrompt =
      `Game state: Street=${communityCards === 'none' ? 'preflop' : 'postflop'}, ` +
      `Community=[${communityCards}], Your hole cards=[${hole}], ` +
      `Pot=${pot}, Your stack=${myStack}, To call=${toCall}, Min raise=${minRaise}, BB=${bigBlind}. ` +
      `Recent actions: ${recentActions || 'none'}. ` +
      `Your recent history: ${sessionContext || 'none'}. ` +
      `Available actions: [${availableActions.join(', ')}]. ` +
      `Respond ONLY with valid JSON: {"action": "fold"|"check"|"call"|"raise"|"allin", "amount": null_or_number, "chat": null_or_string}`;

    const responseText = await this._fetchGemini(systemPrompt, userPrompt);

    // Parse JSON from response
    const jsonMatch = responseText.match(/\{[\s\S]*?\}/);
    if (!jsonMatch) {
      throw new Error('No JSON found in Gemini response');
    }

    const parsed = JSON.parse(jsonMatch[0]);
    return {
      action: parsed.action,
      amount: parsed.amount || null,
      chat: parsed.chat || null,
    };
  }

  // =========================================================================
  // PRIVATE: Raw Gemini fetch
  // =========================================================================
  async _fetchGemini(systemPrompt, userPrompt) {
    if (!this._apiKey) {
      throw new Error('No API key configured');
    }

    const url = `${this._apiEndpoint}?key=${this._apiKey}`;
    const body = {
      contents: [
        ...(systemPrompt
          ? [{ role: 'user', parts: [{ text: `[System instruction] ${systemPrompt}` }] },
             { role: 'model', parts: [{ text: 'Understood. I will play in character.' }] }]
          : []),
        { role: 'user', parts: [{ text: userPrompt }] },
      ],
      generationConfig: {
        temperature: 0.8,
        maxOutputTokens: 150,
      },
    };

    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      throw new Error(`Gemini API error: ${response.status}`);
    }

    const data = await response.json();
    const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
    if (!text) {
      throw new Error('Empty Gemini response');
    }
    return text;
  }

  // =========================================================================
  // PRIVATE: Local fallback logic
  // =========================================================================
  _localFallback(seatIndex, effectiveStats, gameState, holeCards) {
    const { vpip, pfr } = effectiveStats;
    const canCheck = this._canCheck(seatIndex, gameState);
    const player = this._findPlayer(seatIndex, gameState);
    const myStack = player ? player.chips : 0;
    const pot = gameState.pot || 0;
    const currentBet = gameState.currentBet || 0;
    const myBet = player ? (player.currentBet || 0) : 0;
    const toCall = Math.max(0, currentBet - myBet);
    const bigBlind = gameState.bigBlind || 50;
    const isPreFlop = !gameState.communityCards || gameState.communityCards.length === 0;

    // Decide whether to play
    if (Math.random() * 100 < vpip) {
      // Playing the hand
      if (pfr > 0 && Math.random() * 100 < (pfr / vpip) * 100) {
        // Raise
        let raiseAmount;
        if (isPreFlop) {
          raiseAmount = Math.round(bigBlind * (2.5 + Math.random() * 0.5));
        } else {
          raiseAmount = Math.round(pot * (0.5 + Math.random() * 0.25));
        }
        raiseAmount = clamp(raiseAmount, currentBet * 2 || bigBlind * 2, myStack);

        if (raiseAmount >= myStack) {
          return { action: 'allin', amount: myStack };
        }
        return { action: 'raise', amount: raiseAmount };
      }
      // Call
      if (toCall > 0 && toCall <= myStack) {
        return { action: 'call' };
      }
      if (canCheck) {
        return { action: 'check' };
      }
      return { action: 'fold' };
    }

    // Not playing
    if (canCheck) return { action: 'check' };
    return { action: 'fold' };
  }

  // =========================================================================
  // PRIVATE: Validate action is legal
  // =========================================================================
  _validateAction(result, seatIndex, gameState) {
    const validActions = ['fold', 'check', 'call', 'raise', 'allin'];
    if (!result || !validActions.includes(result.action)) {
      return { action: this._canCheck(seatIndex, gameState) ? 'check' : 'fold' };
    }

    const player = this._findPlayer(seatIndex, gameState);
    const myStack = player ? player.chips : 0;
    const currentBet = gameState.currentBet || 0;
    const myBet = player ? (player.currentBet || 0) : 0;
    const toCall = Math.max(0, currentBet - myBet);

    switch (result.action) {
      case 'check':
        if (toCall > 0) {
          return { action: 'fold' };
        }
        break;
      case 'call':
        if (toCall === 0) {
          return { action: 'check' };
        }
        if (toCall > myStack) {
          return { action: 'allin', amount: myStack };
        }
        break;
      case 'raise':
        if (myStack <= 0) return { action: 'check' };
        if (result.amount && result.amount >= myStack) {
          return { action: 'allin', amount: myStack };
        }
        // Ensure minimum raise
        {
          const minRaise = gameState.minRaise || (currentBet * 2) || ((gameState.bigBlind || 50) * 2);
          if (result.amount && result.amount < minRaise) {
            result.amount = minRaise;
          }
        }
        break;
      case 'allin':
        result.amount = myStack;
        break;
    }

    return {
      action: result.action,
      amount: result.amount || undefined,
      chat: result.chat || undefined,
    };
  }

  // =========================================================================
  // PRIVATE: Helpers
  // =========================================================================
  _canCheck(seatIndex, gameState) {
    const player = this._findPlayer(seatIndex, gameState);
    const currentBet = gameState.currentBet || 0;
    const myBet = player ? (player.currentBet || 0) : 0;
    return currentBet <= myBet;
  }

  _findPlayer(seatIndex, gameState) {
    if (!gameState.players) return null;
    return gameState.players.find((p) => p.seatIndex === seatIndex) || null;
  }

  _logAction(seatIndex, result, gameState) {
    const seatData = this._seats.get(seatIndex);
    if (!seatData) return;
    const street = gameState.communityCards && gameState.communityCards.length > 0
      ? (gameState.communityCards.length <= 3 ? 'flop' : gameState.communityCards.length === 4 ? 'turn' : 'river')
      : 'preflop';
    seatData.sessionLog.push({
      street,
      action: result.action,
      amount: result.amount || null,
    });
    // Keep only last 10
    if (seatData.sessionLog.length > 10) {
      seatData.sessionLog.shift();
    }
  }

  _emit(event, data) {
    const listeners = this._listeners.get(event);
    if (listeners) {
      for (const cb of listeners) {
        try {
          cb(data);
        } catch {
          // Never crash the game from a listener error
        }
      }
    }
  }

  _localChat(persona, event) {
    // Simple fallback chat lines
    const lines = {
      'calling-station': ['I have to see the river!', 'Can\'t fold now...', 'I\'ll call.'],
      'whale': ['Let\'s make it interesting!', 'Money is just numbers!', 'RAISE!'],
      'superstitious': ['I feel lucky!', 'The cards are with me.', 'Bad vibes on this one...'],
      'rock': ['Hmph.', '...', 'Back in my day...'],
      'nit': ['Oh no...', 'That\'s scary.', 'I should fold...'],
      'set-miner': ['...', 'Patience.', 'Not yet.'],
      'maniac': ['ALL IN! Just kidding. Or am I?', 'You scared?', 'Let\'s GOOOO!'],
      'bully': ['You sure about that?', 'I\'ve got you covered.', 'Fold already.'],
      'lag-pro': ['Interesting.', 'Math checks out.', '...'],
      'math-whiz': ['The odds favor me.', 'Statistically speaking...', 'EV positive.'],
      'sheriff': ['I don\'t believe you.', 'Show me.', 'You\'re bluffing.'],
      'tilter': ['This is RIGGED!', 'Unbelievable!', 'Fine. FINE.'],
      'speech-player': ['What do you have?', 'Will you show?', 'I think you\'re bluffing...'],
      'mirror': ['Same.', 'I see what you did there.', 'Interesting move.'],
      'newbie': ['Wait, is it my turn?', 'Does a flush beat a straight?', 'Oops!'],
    };
    const pool = lines[persona.id] || ['...'];
    return pool[Math.floor(Math.random() * pool.length)];
  }
}

// ---------------------------------------------------------------------------
// EXPORT
// ---------------------------------------------------------------------------
export default NPCEngine;

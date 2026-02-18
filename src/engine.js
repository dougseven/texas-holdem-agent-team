// Texas Hold'em Poker Engine
// Self-contained ES module — no external dependencies

// ============================================================
// Constants
// ============================================================
const RANKS = ['2','3','4','5','6','7','8','9','T','J','Q','K','A'];
const SUITS = ['s','h','d','c'];
const RANK_VALUE = Object.fromEntries(RANKS.map((r, i) => [r, i]));

const BLIND_LEVELS = [
  null, // index 0 unused
  { sb: 25,   bb: 50,   ante: 0 },
  { sb: 50,   bb: 100,  ante: 0 },
  { sb: 75,   bb: 150,  ante: 0 },
  { sb: 100,  bb: 200,  ante: 0 },
  { sb: 150,  bb: 300,  ante: 0 },
  { sb: 200,  bb: 400,  ante: 400 },
  { sb: 300,  bb: 600,  ante: 600 },
  { sb: 400,  bb: 800,  ante: 800 },
  { sb: 600,  bb: 1200, ante: 1200 },
  { sb: 1000, bb: 2000, ante: 2000 },
  { sb: 1500, bb: 3000, ante: 3000 },
  { sb: 2000, bb: 4000, ante: 4000 },
];

const HAND_RANK = {
  HIGH_CARD: 0,
  ONE_PAIR: 1,
  TWO_PAIR: 2,
  THREE_OF_A_KIND: 3,
  STRAIGHT: 4,
  FLUSH: 5,
  FULL_HOUSE: 6,
  FOUR_OF_A_KIND: 7,
  STRAIGHT_FLUSH: 8,
  ROYAL_FLUSH: 9,
};

const HAND_NAMES = [
  'High Card','One Pair','Two Pair','Three of a Kind','Straight',
  'Flush','Full House','Four of a Kind','Straight Flush','Royal Flush',
];

const LEVEL_DURATION_SECONDS = 300; // 5 minutes per PRD

// ============================================================
// Deck
// ============================================================
function createDeck() {
  const deck = [];
  for (const suit of SUITS) {
    for (const rank of RANKS) {
      deck.push({ rank, suit });
    }
  }
  return deck;
}

function shuffleDeck(deck) {
  // Fisher-Yates
  for (let i = deck.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [deck[i], deck[j]] = [deck[j], deck[i]];
  }
  return deck;
}

// ============================================================
// Hand Evaluator
// ============================================================
class HandEvaluator {
  /**
   * Evaluate the best 5-card hand from up to 7 cards.
   * Returns { rank, kickers, name }
   *   rank: HAND_RANK value (0-9)
   *   kickers: array of values for tie-breaking (highest first)
   *   name: human-readable string
   */
  static evaluate(cards) {
    if (cards.length < 5) throw new Error('Need at least 5 cards');
    const combos = HandEvaluator._combinations(cards, 5);
    let best = null;
    for (const combo of combos) {
      const score = HandEvaluator._score5(combo);
      if (!best || HandEvaluator._compareSingle(score, best) > 0) {
        best = score;
      }
    }
    return best;
  }

  /**
   * Compare two evaluated hands. Returns >0 if a wins, <0 if b wins, 0 if tie.
   */
  static compare(a, b) {
    return HandEvaluator._compareSingle(a, b);
  }

  // --- internal ---

  static _compareSingle(a, b) {
    if (a.rank !== b.rank) return a.rank - b.rank;
    for (let i = 0; i < a.kickers.length; i++) {
      if (a.kickers[i] !== b.kickers[i]) return a.kickers[i] - b.kickers[i];
    }
    return 0;
  }

  static _score5(cards) {
    const vals = cards.map(c => RANK_VALUE[c.rank]).sort((a, b) => b - a);
    const suits = cards.map(c => c.suit);

    const isFlush = suits.every(s => s === suits[0]);

    // Check straight (including A-2-3-4-5 wheel)
    let isStraight = false;
    let straightHigh = 0;
    const unique = [...new Set(vals)].sort((a, b) => b - a);
    if (unique.length === 5) {
      if (unique[0] - unique[4] === 4) {
        isStraight = true;
        straightHigh = unique[0];
      }
      // Wheel: A-2-3-4-5
      if (unique[0] === 12 && unique[1] === 3 && unique[2] === 2 && unique[3] === 1 && unique[4] === 0) {
        isStraight = true;
        straightHigh = 3; // 5-high straight
      }
    }

    // Count ranks
    const counts = {};
    for (const v of vals) counts[v] = (counts[v] || 0) + 1;
    const groups = Object.entries(counts)
      .map(([v, c]) => ({ val: Number(v), count: c }))
      .sort((a, b) => b.count - a.count || b.val - a.val);

    if (isStraight && isFlush) {
      if (straightHigh === 12) return { rank: HAND_RANK.ROYAL_FLUSH, kickers: [straightHigh], name: HAND_NAMES[9] };
      return { rank: HAND_RANK.STRAIGHT_FLUSH, kickers: [straightHigh], name: HAND_NAMES[8] };
    }
    if (groups[0].count === 4) {
      return { rank: HAND_RANK.FOUR_OF_A_KIND, kickers: [groups[0].val, groups[1].val], name: HAND_NAMES[7] };
    }
    if (groups[0].count === 3 && groups[1].count === 2) {
      return { rank: HAND_RANK.FULL_HOUSE, kickers: [groups[0].val, groups[1].val], name: HAND_NAMES[6] };
    }
    if (isFlush) {
      return { rank: HAND_RANK.FLUSH, kickers: vals, name: HAND_NAMES[5] };
    }
    if (isStraight) {
      return { rank: HAND_RANK.STRAIGHT, kickers: [straightHigh], name: HAND_NAMES[4] };
    }
    if (groups[0].count === 3) {
      const k = groups.slice(1).map(g => g.val).sort((a, b) => b - a);
      return { rank: HAND_RANK.THREE_OF_A_KIND, kickers: [groups[0].val, ...k], name: HAND_NAMES[3] };
    }
    if (groups[0].count === 2 && groups[1].count === 2) {
      const pairHigh = Math.max(groups[0].val, groups[1].val);
      const pairLow = Math.min(groups[0].val, groups[1].val);
      const kicker = groups[2].val;
      return { rank: HAND_RANK.TWO_PAIR, kickers: [pairHigh, pairLow, kicker], name: HAND_NAMES[2] };
    }
    if (groups[0].count === 2) {
      const k = groups.slice(1).map(g => g.val).sort((a, b) => b - a);
      return { rank: HAND_RANK.ONE_PAIR, kickers: [groups[0].val, ...k], name: HAND_NAMES[1] };
    }
    return { rank: HAND_RANK.HIGH_CARD, kickers: vals, name: HAND_NAMES[0] };
  }

  static _combinations(arr, k) {
    const result = [];
    const combo = [];
    function dfs(start) {
      if (combo.length === k) { result.push([...combo]); return; }
      for (let i = start; i < arr.length; i++) {
        combo.push(arr[i]);
        dfs(i + 1);
        combo.pop();
      }
    }
    dfs(0);
    return result;
  }
}

// ============================================================
// EventEmitter (minimal)
// ============================================================
class EventEmitter {
  constructor() { this._listeners = {}; }
  on(event, cb) {
    (this._listeners[event] ||= []).push(cb);
  }
  _emit(event, data) {
    for (const cb of (this._listeners[event] || [])) cb(data);
  }
}

// ============================================================
// GameEngine
// ============================================================
class GameEngine extends EventEmitter {
  constructor(config = {}) {
    super();
    this.numPlayers = config.numPlayers || 6;
    this.startingChips = config.startingChips || 5000;
    this.startingBlinds = config.startingBlinds || { sb: 25, bb: 50, ante: 0 };

    this.players = [];
    this.communityCards = [];
    this.deck = [];
    this.pot = 0;
    this.sidePots = [];
    this.currentBet = 0;
    this.minRaise = 0;
    this.actionSeat = -1;
    this.phase = 'waiting';
    this.level = 1;
    this.blinds = { ...this.startingBlinds };
    this.activePlayTime = 0;
    this.handHistory = [];
    this.winners = null;
    this.dealerSeat = -1;
    this.sbSeat = -1;
    this.bbSeat = -1;

    // Track bets per street per player for raise logic
    this._streetBets = [];
    // Track total contributions per player for the current hand (for side pots)
    this._handContributions = [];
    // Track who has acted this street (for determining when action is complete)
    this._lastRaiserSeat = -1;
    this._actedThisStreet = new Set();
    // Timer
    this._handStartTime = null;
    this._levelTimeAccumulated = 0;
    this._deadButton = false;
  }

  // ----------------------------------------------------------
  // Tournament lifecycle
  // ----------------------------------------------------------
  startTournament() {
    // Initialize seats
    this.players = [];
    for (let i = 0; i < this.numPlayers; i++) {
      this.players.push({
        seatIndex: i,
        name: `Player ${i + 1}`,
        chips: this.startingChips,
        holeCards: null,
        isActive: true,
        isAllIn: false,
        isFolded: false,
        isEliminated: false,
        isDealer: false,
        isSB: false,
        isBB: false,
      });
    }

    // High-card draw for first dealer
    const drawDeck = shuffleDeck(createDeck());
    let bestVal = -1;
    let bestSeat = 0;
    for (let i = 0; i < this.numPlayers; i++) {
      const card = drawDeck[i];
      const val = RANK_VALUE[card.rank] * 4 + SUITS.indexOf(card.suit);
      if (val > bestVal) { bestVal = val; bestSeat = i; }
    }
    this.dealerSeat = bestSeat;
    this.level = 1;
    this.blinds = { ...BLIND_LEVELS[1] };
    this._levelTimeAccumulated = 0;
    this.phase = 'waiting';
    this._emitState();
  }

  startHand() {
    // Reset per-hand state
    this.communityCards = [];
    this.pot = 0;
    this.sidePots = [];
    this.currentBet = 0;
    this.winners = null;
    this.handHistory = [];

    this.deck = shuffleDeck(createDeck());

    // Reset player hand state
    for (const p of this.players) {
      if (!p.isEliminated) {
        p.isActive = true;
        p.isAllIn = false;
        p.isFolded = false;
        p.holeCards = null;
        p.isDealer = false;
        p.isSB = false;
        p.isBB = false;
      }
    }

    // Assign positions
    const active = this._activeSeatList();
    if (active.length < 2) {
      // Tournament over
      this._emit('tournamentComplete', { winner: active[0] });
      return;
    }

    this.players[this.dealerSeat].isDealer = true;

    if (active.length === 2) {
      // Heads-up: dealer is SB
      this.sbSeat = this.dealerSeat;
      this.bbSeat = this._nextActiveSeat(this.dealerSeat);
    } else {
      this.sbSeat = this._nextActiveSeat(this.dealerSeat);
      this.bbSeat = this._nextActiveSeat(this.sbSeat);
    }
    this.players[this.sbSeat].isSB = true;
    this.players[this.bbSeat].isBB = true;

    // Post blinds
    this._streetBets = new Array(this.players.length).fill(0);
    this._handContributions = new Array(this.players.length).fill(0);
    this._postBlind(this.sbSeat, this.blinds.sb);
    this._postBlind(this.bbSeat, this.blinds.bb);
    this.currentBet = this.blinds.bb;
    this.minRaise = this.blinds.bb; // min raise size

    // Post antes (BB ante style — collected from everyone)
    if (this.blinds.ante > 0) {
      for (const seat of active) {
        this._postAnte(seat, this.blinds.ante);
      }
    }

    // Deal hole cards
    for (const seat of active) {
      this.players[seat].holeCards = [this.deck.pop(), this.deck.pop()];
    }

    // Set action
    this.phase = 'preflop';
    if (active.length === 2) {
      // Heads-up: SB (dealer) acts first preflop
      this.actionSeat = this.sbSeat;
    } else {
      this.actionSeat = this._nextActiveSeat(this.bbSeat);
    }
    this._lastRaiserSeat = this.bbSeat; // BB is the "last raiser" initially
    this._actedThisStreet = new Set();

    this._handStartTime = Date.now();
    this._emitState();
  }

  getGameState() {
    return {
      phase: this.phase,
      players: this.players.map(p => ({
        ...p,
        holeCards: p.holeCards ? [...p.holeCards] : null,
        currentBet: this._streetBets ? (this._streetBets[p.seatIndex] || 0) : 0,
      })),
      communityCards: [...this.communityCards],
      pot: this.pot,
      sidePots: this.sidePots.map(sp => ({ ...sp, eligibleSeats: [...sp.eligibleSeats] })),
      currentBet: this.currentBet,
      minRaise: this.minRaise,
      actionSeat: this.actionSeat,
      level: this.level,
      blinds: { ...this.blinds },
      activePlayTime: this.activePlayTime,
      handHistory: [...this.handHistory],
      winners: this.winners,
    };
  }

  processAction(seatIndex, action, amount) {
    const player = this.players[seatIndex];
    if (seatIndex !== this.actionSeat) throw new Error(`Not seat ${seatIndex}'s turn (expected ${this.actionSeat})`);
    if (player.isFolded || player.isEliminated || player.isAllIn) throw new Error('Player cannot act');

    const toCall = this.currentBet - this._streetBets[seatIndex];

    switch (action) {
      case 'fold':
        player.isFolded = true;
        player.isActive = false;
        this.handHistory.push({ seat: seatIndex, action: 'fold' });
        break;

      case 'check':
        if (toCall > 0) throw new Error('Cannot check — must call or raise');
        this.handHistory.push({ seat: seatIndex, action: 'check' });
        break;

      case 'call': {
        const callAmt = Math.min(toCall, player.chips);
        this._betFromPlayer(seatIndex, callAmt);
        this.handHistory.push({ seat: seatIndex, action: 'call', amount: callAmt });
        break;
      }

      case 'raise': {
        if (amount === undefined) throw new Error('Raise requires an amount (total bet size)');
        const totalBet = amount;
        const raiseBy = totalBet - this.currentBet;
        if (raiseBy < this.minRaise && totalBet < player.chips + this._streetBets[seatIndex]) {
          throw new Error(`Raise must be at least ${this.minRaise} more (total ${this.currentBet + this.minRaise})`);
        }
        const needed = totalBet - this._streetBets[seatIndex];
        const actual = Math.min(needed, player.chips);
        this._betFromPlayer(seatIndex, actual);
        const actualTotal = this._streetBets[seatIndex];
        const actualRaiseBy = actualTotal - this.currentBet;
        if (actualRaiseBy > 0) {
          this.minRaise = Math.max(this.minRaise, actualRaiseBy);
        }
        if (actualTotal > this.currentBet) {
          this.currentBet = actualTotal;
          this._lastRaiserSeat = seatIndex;
          this._actedThisStreet = new Set([seatIndex]);
        }
        this.handHistory.push({ seat: seatIndex, action: 'raise', amount: actualTotal });
        break;
      }

      case 'allin': {
        const allInAmt = player.chips;
        this._betFromPlayer(seatIndex, allInAmt);
        const totalNow = this._streetBets[seatIndex];
        if (totalNow > this.currentBet) {
          const raiseBy = totalNow - this.currentBet;
          if (raiseBy >= this.minRaise) {
            this.minRaise = raiseBy;
          }
          this.currentBet = totalNow;
          this._lastRaiserSeat = seatIndex;
          this._actedThisStreet = new Set([seatIndex]);
        }
        this.handHistory.push({ seat: seatIndex, action: 'allin', amount: allInAmt });
        break;
      }

      default:
        throw new Error(`Unknown action: ${action}`);
    }

    this._actedThisStreet.add(seatIndex);

    // Check if only one player remains
    const remaining = this._playersInHand();
    if (remaining.length === 1) {
      // Last player standing — wins without showdown; set winners so awardPot() can run
      const winner = this.players[remaining[0]];
      const totalPot = this.pot + this.sidePots.reduce((s, sp) => s + sp.amount, 0);
      this.winners = [{ seatIndex: winner.seatIndex, amount: totalPot, handName: 'Last Standing' }];
      this.phase = 'showdown';
      this._emitState();
      return;
    }

    // Advance action or street
    this._advanceAction();
    this._emitState();
  }

  advanceStreet() {
    // Deal community cards for next street
    switch (this.phase) {
      case 'preflop':
        this.deck.pop(); // burn
        this.communityCards.push(this.deck.pop(), this.deck.pop(), this.deck.pop());
        this.phase = 'flop';
        break;
      case 'flop':
        this.deck.pop(); // burn
        this.communityCards.push(this.deck.pop());
        this.phase = 'turn';
        break;
      case 'turn':
        this.deck.pop(); // burn
        this.communityCards.push(this.deck.pop());
        this.phase = 'river';
        break;
      default:
        throw new Error(`Cannot advance street from phase: ${this.phase}`);
    }

    // Reset street state
    this.currentBet = 0;
    this.minRaise = this.blinds.bb;
    this._streetBets = new Array(this.players.length).fill(0);
    this._lastRaiserSeat = -1;
    this._actedThisStreet = new Set();

    // Set action to first active player left of button
    const firstToAct = this._firstActiveAfter(this.dealerSeat);
    if (firstToAct === -1 || this._playersWhoCanAct().length === 0) {
      // All remaining players are all-in — no further action, auto-advance
      this.actionSeat = -1;
    } else {
      this.actionSeat = firstToAct;
    }

    this._emitState();
  }

  evaluateShowdown() {
    const inHand = this._playersInHand();

    if (inHand.length === 1) {
      // Last player standing — no cards shown
      const winner = this.players[inHand[0]];
      const totalPot = this.pot + this.sidePots.reduce((s, sp) => s + sp.amount, 0);
      this.winners = [{ seatIndex: winner.seatIndex, amount: totalPot, handName: 'Last Standing' }];
      this.phase = 'showdown';
      this._emitState();
      return;
    }

    // Build side pots
    this._buildSidePots();

    // Evaluate each pot
    const allWinners = [];
    const potsToEvaluate = this.sidePots.length > 0 ? this.sidePots : [{ amount: this.pot, eligibleSeats: inHand }];

    for (const pot of potsToEvaluate) {
      const eligible = pot.eligibleSeats.filter(s => inHand.includes(s));
      if (eligible.length === 0) continue;

      // Evaluate hands
      const hands = eligible.map(s => ({
        seat: s,
        eval: HandEvaluator.evaluate([...this.players[s].holeCards, ...this.communityCards]),
      }));

      // Find best hand
      hands.sort((a, b) => HandEvaluator.compare(b.eval, a.eval));
      const bestEval = hands[0].eval;

      // Collect all winners (split pot)
      const winners = hands.filter(h => HandEvaluator.compare(h.eval, bestEval) === 0);
      const share = Math.floor(pot.amount / winners.length);
      let remainder = pot.amount - share * winners.length;

      // Odd chips go to player closest left of button
      const buttonOrder = this._seatsLeftOfButton();
      for (const w of winners) {
        let extra = 0;
        if (remainder > 0) {
          // Give 1 chip to the winner closest left of button
          const firstLeft = buttonOrder.find(s => winners.some(ww => ww.seat === s));
          if (firstLeft === w.seat) {
            extra = remainder;
            remainder = 0;
          }
        }
        allWinners.push({
          seatIndex: w.seat,
          amount: share + extra,
          handName: w.eval.name,
        });
      }
    }

    // Merge duplicate winners (same seat across multiple pots)
    const merged = {};
    for (const w of allWinners) {
      if (merged[w.seatIndex]) {
        merged[w.seatIndex].amount += w.amount;
      } else {
        merged[w.seatIndex] = { ...w };
      }
    }

    this.winners = Object.values(merged);
    this.phase = 'showdown';
    this._emitState();
  }

  awardPot() {
    if (!this.winners) throw new Error('No winners to award');
    for (const w of this.winners) {
      this.players[w.seatIndex].chips += w.amount;
    }
    this.pot = 0;
    this.sidePots = [];
    this._emit('handComplete', { winners: this.winners });
    this._emitState();
  }

  finishHand() {
    // Track play time
    if (this._handStartTime) {
      const elapsed = (Date.now() - this._handStartTime) / 1000;
      this.activePlayTime += elapsed;
      this._levelTimeAccumulated += elapsed;
      this._handStartTime = null;
    }

    // Check for level up
    if (this._levelTimeAccumulated >= LEVEL_DURATION_SECONDS && this.level < BLIND_LEVELS.length - 1) {
      this.level++;
      this.blinds = { ...BLIND_LEVELS[this.level] };
      this._levelTimeAccumulated -= LEVEL_DURATION_SECONDS;
      this._emit('levelUp', { level: this.level, blinds: this.blinds });
    }

    // Eliminate busted players
    for (const p of this.players) {
      if (!p.isEliminated && p.chips <= 0) {
        p.isEliminated = true;
        p.isActive = false;
        this._emit('playerEliminated', { seatIndex: p.seatIndex, name: p.name });
      }
    }

    // Check tournament completion
    const alive = this.players.filter(p => !p.isEliminated);
    if (alive.length <= 1) {
      this.phase = 'handComplete';
      this._emit('tournamentComplete', { winner: alive[0] || null });
      this._emitState();
      return;
    }

    // Move button — Dead Button rule
    this._moveButton();

    this.phase = 'handComplete';
    this._emitState();
  }

  // ----------------------------------------------------------
  // Internal helpers
  // ----------------------------------------------------------

  _activeSeatList() {
    return this.players
      .filter(p => !p.isEliminated)
      .map(p => p.seatIndex);
  }

  _playersInHand() {
    return this.players
      .filter(p => !p.isEliminated && !p.isFolded)
      .map(p => p.seatIndex);
  }

  _playersWhoCanAct() {
    return this.players
      .filter(p => !p.isEliminated && !p.isFolded && !p.isAllIn)
      .map(p => p.seatIndex);
  }

  _nextActiveSeat(from) {
    const n = this.players.length;
    for (let i = 1; i <= n; i++) {
      const seat = (from + i) % n;
      if (!this.players[seat].isEliminated) return seat;
    }
    return from;
  }

  _firstActiveAfter(from) {
    // First non-folded, non-eliminated, non-all-in player after 'from'
    const n = this.players.length;
    for (let i = 1; i <= n; i++) {
      const seat = (from + i) % n;
      const p = this.players[seat];
      if (!p.isEliminated && !p.isFolded && !p.isAllIn) return seat;
    }
    return -1;
  }

  _seatsLeftOfButton() {
    const n = this.players.length;
    const order = [];
    for (let i = 1; i <= n; i++) {
      order.push((this.dealerSeat + i) % n);
    }
    return order;
  }

  _postBlind(seat, amount) {
    const player = this.players[seat];
    const actual = Math.min(amount, player.chips);
    player.chips -= actual;
    this.pot += actual;
    this._streetBets[seat] = actual;
    this._handContributions[seat] += actual;
    if (player.chips === 0) player.isAllIn = true;
  }

  _postAnte(seat, amount) {
    const player = this.players[seat];
    const actual = Math.min(amount, player.chips);
    player.chips -= actual;
    this.pot += actual;
    this._handContributions[seat] += actual;
    // Antes don't count toward street bets for calling purposes
    if (player.chips === 0) player.isAllIn = true;
  }

  _betFromPlayer(seat, amount) {
    const player = this.players[seat];
    const actual = Math.min(amount, player.chips);
    player.chips -= actual;
    this.pot += actual;
    this._streetBets[seat] += actual;
    this._handContributions[seat] += actual;
    if (player.chips === 0) player.isAllIn = true;
  }

  _advanceAction() {
    const canAct = this._playersWhoCanAct();
    if (canAct.length === 0) {
      // Everyone is all-in or folded — no more action
      this.actionSeat = -1;
      return;
    }

    // Find next player who can act
    const n = this.players.length;
    for (let i = 1; i <= n; i++) {
      const seat = (this.actionSeat + i) % n;
      const p = this.players[seat];
      if (p.isEliminated || p.isFolded || p.isAllIn) continue;

      // Check if this seat still needs to act
      if (!this._actedThisStreet.has(seat) || this._streetBets[seat] < this.currentBet) {
        this.actionSeat = seat;
        return;
      }
    }

    // All eligible players have acted and matched — street is complete
    this.actionSeat = -1;
  }

  _moveButton() {
    const nextSeat = this._nextActiveSeat(this.dealerSeat);
    // Dead button check: if the player in the SB position was eliminated,
    // keep the button in place for one hand
    const wouldBeSB = this._nextActiveSeat(nextSeat);
    if (this.players[this.sbSeat].isEliminated && nextSeat === this.sbSeat) {
      // Dead button — button stays
      this._deadButton = true;
    } else {
      this.dealerSeat = nextSeat;
      this._deadButton = false;
    }
  }

  _buildSidePots() {
    const inHand = this._playersInHand();

    // Get all players who contributed (including folded — they contributed but aren't eligible)
    const allContributors = this.players
      .filter(p => !p.isEliminated && this._handContributions[p.seatIndex] > 0)
      .map(p => p.seatIndex);

    const allInPlayers = inHand.filter(s => this.players[s].isAllIn);

    // If no all-in players, single pot
    if (allInPlayers.length === 0) {
      this.sidePots = [{ amount: this.pot, eligibleSeats: [...inHand] }];
      return;
    }

    // Get unique contribution levels from all-in players (sorted ascending)
    const allInLevels = [...new Set(allInPlayers.map(s => this._handContributions[s]))].sort((a, b) => a - b);

    // Build side pots layer by layer
    const pots = [];
    let prevLevel = 0;

    for (const level of allInLevels) {
      if (level <= prevLevel) continue;
      const increment = level - prevLevel;
      // Count all contributors (including folded) who put in at least this level
      let potAmount = 0;
      for (const s of allContributors) {
        potAmount += Math.min(increment, Math.max(0, this._handContributions[s] - prevLevel));
      }
      // Only non-folded, non-eliminated players at this level are eligible
      const eligibleSeats = inHand.filter(s => this._handContributions[s] >= level);
      pots.push({ amount: potAmount, eligibleSeats });
      prevLevel = level;
    }

    // Remaining pot for players who contributed more than the highest all-in level
    const maxAllInLevel = allInLevels[allInLevels.length - 1];
    let remaining = 0;
    for (const s of allContributors) {
      remaining += Math.max(0, this._handContributions[s] - maxAllInLevel);
    }
    if (remaining > 0) {
      const eligibleSeats = inHand.filter(s => this._handContributions[s] > maxAllInLevel);
      pots.push({ amount: remaining, eligibleSeats });
    }

    this.sidePots = pots;
  }

  _emitState() {
    this._emit('stateChange', this.getGameState());
  }
}

export default GameEngine;
export { HandEvaluator };

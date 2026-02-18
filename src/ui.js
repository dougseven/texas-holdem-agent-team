/**
 * UIController - Manages all DOM rendering and user interaction for the poker game.
 * Works with GameEngine and NPCEngine via their public APIs.
 */

// Seat positions around the oval table (percentage-based)
// Seat 0 = bottom center (human), seats 1-9 clockwise
const SEAT_POSITIONS = [
  { top: 88, left: 50 },   // 0: bottom center (human)
  { top: 78, left: 18 },   // 1: bottom-left
  { top: 55, left: 5 },    // 2: left
  { top: 28, left: 10 },   // 3: upper-left
  { top: 8,  left: 26 },   // 4: top-left
  { top: 4,  left: 50 },   // 5: top center
  { top: 8,  left: 74 },   // 6: top-right
  { top: 28, left: 90 },   // 7: upper-right
  { top: 55, left: 95 },   // 8: right
  { top: 78, left: 82 },   // 9: bottom-right
];

const SUIT_SYMBOLS = { s: '\u2660', h: '\u2665', d: '\u2666', c: '\u2663' };
const SUIT_COLORS = { s: '#1a1a1a', h: '#d32f2f', d: '#d32f2f', c: '#1a1a1a' };
const RANK_DISPLAY = {
  '2': '2', '3': '3', '4': '4', '5': '5', '6': '6', '7': '7', '8': '8', '9': '9',
  'T': '10', 'J': 'J', 'Q': 'Q', 'K': 'K', 'A': 'A'
};

export default class UIController {
  constructor(gameEngine, npcEngine) {
    this.gameEngine = gameEngine;
    this.npcEngine = npcEngine;
    this._actionResolve = null;
    this._chatFadeTimers = [];
    this._timerInterval = null;
    this._timerRemaining = 300;
    this._lastState = null;
  }

  init() {
    this._createSeats();
    this._setupActionButtons();
    this._setupChatPresets();
    this._setupRaiseControls();
  }

  // Create the 10 seat DOM elements positioned around the table
  _createSeats() {
    const container = document.getElementById('seats-container');
    container.innerHTML = '';

    for (let i = 0; i < 10; i++) {
      const pos = SEAT_POSITIONS[i];
      const seat = document.createElement('div');
      seat.className = 'seat';
      seat.id = `seat-${i}`;
      seat.style.top = `${pos.top}%`;
      seat.style.left = `${pos.left}%`;
      seat.style.transform = 'translate(-50%, -50%)';

      seat.innerHTML = `
        <div class="action-indicator" id="action-ind-${i}"></div>
        <div class="seat-inner">
          <div class="player-name" id="name-${i}">Empty</div>
          <div class="chip-count" id="chips-${i}">$0</div>
          <div class="cards-area" id="cards-${i}"></div>
          <div class="badges" id="badges-${i}"></div>
          <div class="thinking-indicator" id="thinking-${i}">
            <span class="thinking-dots">Thinking</span>
          </div>
        </div>
      `;

      container.appendChild(seat);
    }
  }

  // Wire up Fold / Check-Call / Raise buttons
  _setupActionButtons() {
    document.getElementById('btn-fold').addEventListener('click', () => {
      this._submitAction('fold');
    });

    document.getElementById('btn-check-call').addEventListener('click', () => {
      const state = this._lastState;
      if (!state) return;
      const player = state.players[0];
      const toCall = (state.currentBet || 0) - (player.currentBet || 0);
      this._submitAction(toCall > 0 ? 'call' : 'check');
    });

    document.getElementById('btn-raise').addEventListener('click', () => {
      const amount = parseInt(document.getElementById('raise-amount').value, 10);
      if (amount > 0) {
        this._submitAction('raise', amount);
      }
    });
  }

  _submitAction(action, amount) {
    this._disableActions();
    try {
      this.gameEngine.processAction(0, action, amount);
    } catch (err) {
      console.error('Invalid action:', err.message);
      // Re-enable buttons so the player can try again
      if (this._lastState) this._renderActionButtons(this._lastState);
    }
  }

  // Setup chat preset popover buttons
  _setupChatPresets() {
    const presetBtns = document.querySelectorAll('.chat-preset-btn');
    presetBtns.forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        const popover = btn.querySelector('.chat-popover');
        // Close other popovers
        document.querySelectorAll('.chat-popover.open').forEach(p => {
          if (p !== popover) p.classList.remove('open');
        });
        popover.classList.toggle('open');
      });
    });

    // Close popovers on outside click
    document.addEventListener('click', () => {
      document.querySelectorAll('.chat-popover.open').forEach(p => p.classList.remove('open'));
    });

    // Chat popover item clicks
    document.querySelectorAll('.chat-popover-item').forEach(item => {
      item.addEventListener('click', (e) => {
        e.stopPropagation();
        const msg = item.dataset.msg;
        this._addChatMessage('You', msg, true);
        document.querySelectorAll('.chat-popover.open').forEach(p => p.classList.remove('open'));

        // Trigger NPC chat responses
        if (this.npcEngine && this._lastState) {
          this._triggerNPCChatResponses(msg);
        }
      });
    });
  }

  async _triggerNPCChatResponses(playerMessage) {
    const state = this._lastState;
    if (!state) return;

    for (let i = 1; i <= 9; i++) {
      const player = state.players[i];
      if (!player || player.isEliminated) continue;

      try {
        const chatResp = await this.npcEngine.getChat(i, 'playerChat', state);
        if (chatResp) {
          this.showChat(i, chatResp);
        }
      } catch (e) {
        // NPC chose not to respond, that's fine
      }
    }
  }

  // Raise slider + numeric input sync
  _setupRaiseControls() {
    const slider = document.getElementById('raise-slider');
    const amountInput = document.getElementById('raise-amount');

    slider.addEventListener('input', () => {
      amountInput.value = slider.value;
    });

    amountInput.addEventListener('input', () => {
      const val = parseInt(amountInput.value, 10) || 0;
      slider.value = Math.min(Math.max(val, parseInt(slider.min)), parseInt(slider.max));
    });
  }

  // ===== Main render method =====
  render(gameState) {
    this._lastState = gameState;
    this._renderPlayers(gameState);
    this._renderCommunityCards(gameState);
    this._renderPot(gameState);
    this._renderHumanCards(gameState);
    this._renderActionButtons(gameState);
    this._renderBlindsInfo(gameState);
    this._renderPotOdds(gameState);
  }

  _renderPlayers(state) {
    for (let i = 0; i < 10; i++) {
      const player = state.players[i];
      const seatEl = document.getElementById(`seat-${i}`);
      if (!player) {
        seatEl.style.display = 'none';
        continue;
      }

      seatEl.style.display = '';
      seatEl.className = 'seat';

      if (player.isEliminated) seatEl.classList.add('eliminated');
      else if (player.isFolded) seatEl.classList.add('folded');

      if (state.actionSeat === i && !player.isFolded && !player.isEliminated && !player.isAllIn) {
        seatEl.classList.add('active-turn');
      }

      // Name
      document.getElementById(`name-${i}`).textContent = player.name || `Seat ${i}`;

      // Chips
      const chipsEl = document.getElementById(`chips-${i}`);
      if (player.isEliminated) {
        chipsEl.textContent = 'OUT';
        chipsEl.style.color = '#e53935';
      } else {
        chipsEl.textContent = `$${player.chips.toLocaleString()}`;
        chipsEl.style.color = '';
      }

      // Cards
      const cardsEl = document.getElementById(`cards-${i}`);
      if (player.isEliminated || player.isFolded) {
        cardsEl.innerHTML = '';
      } else if (i === 0 && player.holeCards && player.holeCards.length === 2) {
        // Human player: show face-up (rendered in bottom HUD too, but also in seat)
        cardsEl.innerHTML = player.holeCards.map(c => renderCard(c)).join('');
      } else if (player.holeCards && player.holeCards.length === 2 &&
                 (state.phase === 'showdown' || state.phase === 'handComplete')) {
        // Showdown: reveal NPC cards
        cardsEl.innerHTML = player.holeCards.map(c => renderCard(c)).join('');
      } else if (player.isActive || player.isAllIn) {
        // NPC with hidden cards
        cardsEl.innerHTML = renderCardBack() + renderCardBack();
      } else {
        cardsEl.innerHTML = '';
      }

      // Badges
      const badgesEl = document.getElementById(`badges-${i}`);
      let badges = '';
      if (player.isDealer) badges += '<span class="badge badge-d">D</span>';
      if (player.isSB) badges += '<span class="badge badge-sb">SB</span>';
      if (player.isBB) badges += '<span class="badge badge-bb">BB</span>';
      if (player.isAllIn && !player.isEliminated) badges += '<span class="badge" style="background:#ff6f00;color:#fff;">ALL-IN</span>';
      badgesEl.innerHTML = badges;
    }
  }

  _renderCommunityCards(state) {
    const slots = document.querySelectorAll('#community-cards .card-slot');
    const cards = state.communityCards || [];

    slots.forEach((slot, i) => {
      if (i < cards.length) {
        slot.innerHTML = renderCard(cards[i]);
        if (!slot.classList.contains('dealt')) {
          slot.classList.add('dealt');
        }
      } else {
        slot.innerHTML = '';
        slot.classList.remove('dealt');
      }
    });
  }

  _renderPot(state) {
    const mainPot = state.pot || 0;
    const sidePots = state.sidePots || [];
    let display = `POT: $${mainPot.toLocaleString()}`;
    if (sidePots.length > 0) {
      sidePots.forEach((sp, i) => {
        display += ` | Side ${i + 1}: $${sp.amount.toLocaleString()}`;
      });
    }
    document.getElementById('pot-display').textContent = display;
  }

  _renderHumanCards(state) {
    const container = document.getElementById('human-cards');
    const player = state.players[0];
    if (player && player.holeCards && player.holeCards.length === 2) {
      container.innerHTML = player.holeCards.map(c => renderCard(c, true)).join('');
    } else {
      container.innerHTML = '';
    }
  }

  _renderActionButtons(state) {
    const isHumanTurn = state.actionSeat === 0;
    const player = state.players[0];
    const foldBtn = document.getElementById('btn-fold');
    const checkCallBtn = document.getElementById('btn-check-call');
    const raiseBtn = document.getElementById('btn-raise');
    const slider = document.getElementById('raise-slider');
    const amountInput = document.getElementById('raise-amount');

    if (!isHumanTurn || !player || player.isFolded || player.isEliminated || player.isAllIn) {
      this._disableActions();
      return;
    }

    const toCall = Math.max(0, (state.currentBet || 0) - (player.currentBet || 0));
    const canCheck = toCall === 0;

    foldBtn.disabled = false;

    if (canCheck) {
      checkCallBtn.textContent = 'Check';
    } else {
      checkCallBtn.textContent = `Call $${toCall.toLocaleString()}`;
    }
    checkCallBtn.disabled = false;

    // Raise controls — amount is total bet size for the street (not raise increment)
    const minRaiseIncrement = state.minRaise || (state.blinds ? state.blinds.bb : 50);
    const minTotalBet = (state.currentBet || 0) + minRaiseIncrement;
    const maxTotalBet = (player.currentBet || 0) + player.chips;

    if (maxTotalBet > (state.currentBet || 0)) {
      raiseBtn.disabled = false;
      slider.disabled = false;
      amountInput.disabled = false;
      slider.min = minTotalBet;
      slider.max = maxTotalBet;
      slider.value = minTotalBet;
      amountInput.value = minTotalBet;
    } else {
      // Can only go all-in (call absorbs entire stack)
      raiseBtn.disabled = true;
      slider.disabled = true;
      amountInput.disabled = true;
    }
  }

  _disableActions() {
    document.getElementById('btn-fold').disabled = true;
    document.getElementById('btn-check-call').disabled = true;
    document.getElementById('btn-raise').disabled = true;
    document.getElementById('raise-slider').disabled = true;
    document.getElementById('raise-amount').disabled = true;
  }

  _renderBlindsInfo(state) {
    if (state.level !== undefined) {
      document.getElementById('level-display').textContent = `Level ${state.level}`;
    }
    if (state.blinds) {
      document.getElementById('blinds-display').textContent =
        `Blinds: $${state.blinds.sb.toLocaleString()} / $${state.blinds.bb.toLocaleString()}`;
      const anteEl = document.getElementById('ante-display');
      if (state.blinds.ante > 0) {
        anteEl.style.display = 'block';
        anteEl.textContent = `Ante: $${state.blinds.ante.toLocaleString()}`;
      } else {
        anteEl.style.display = 'none';
      }
    }

    // Timer
    if (state.activePlayTime !== undefined && state.level !== undefined) {
      const levelDuration = 300; // 5 minutes per level
      const elapsed = state.activePlayTime % levelDuration;
      const remaining = levelDuration - elapsed;
      const pct = (remaining / levelDuration) * 100;
      document.getElementById('timer-bar').style.width = `${pct}%`;
      const mins = Math.floor(remaining / 60);
      const secs = remaining % 60;
      document.getElementById('timer-text').textContent =
        `${mins}:${secs.toString().padStart(2, '0')}`;
    }
  }

  _renderPotOdds(state) {
    const display = document.getElementById('pot-odds-display');
    const player = state.players[0];

    if (!player || player.isFolded || player.isEliminated || state.actionSeat !== 0) {
      display.textContent = '';
      return;
    }

    const toCall = Math.max(0, (state.currentBet || 0) - (player.currentBet || 0));
    if (toCall > 0 && state.pot > 0) {
      const potOdds = ((toCall / (state.pot + toCall)) * 100).toFixed(1);
      display.textContent = `Pot Odds: ${potOdds}%`;
    } else {
      display.textContent = '';
    }
  }

  // ===== Public methods for game flow =====

  showThinking(seatIndex) {
    const el = document.getElementById(`thinking-${seatIndex}`);
    if (el) el.classList.add('visible');
  }

  hideThinking(seatIndex) {
    const el = document.getElementById(`thinking-${seatIndex}`);
    if (el) el.classList.remove('visible');
  }

  showChat(seatIndex, message) {
    const state = this._lastState;
    const name = state && state.players[seatIndex]
      ? state.players[seatIndex].name
      : `Seat ${seatIndex}`;
    this._addChatMessage(name, message, false);
  }

  _addChatMessage(name, message, isPlayer) {
    const log = document.getElementById('chat-log');
    const msgEl = document.createElement('div');
    msgEl.className = `chat-msg${isPlayer ? ' player' : ''}`;
    msgEl.innerHTML = `<span class="chat-name">${this._escapeHtml(name)}:</span> ${this._escapeHtml(message)}`;
    log.appendChild(msgEl);
    log.scrollTop = log.scrollHeight;

    // Fade after 4 seconds
    setTimeout(() => {
      msgEl.classList.add('faded');
    }, 4000);
  }

  _escapeHtml(str) {
    const div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
  }

  showActionIndicator(seatIndex, action, amount) {
    const el = document.getElementById(`action-ind-${seatIndex}`);
    if (!el) return;

    let text = action.toUpperCase();
    if (action === 'raise' && amount) text = `RAISE $${amount.toLocaleString()}`;
    if (action === 'call' && amount) text = `CALL $${amount.toLocaleString()}`;
    if (action === 'allin') text = 'ALL-IN';

    el.textContent = text;
    el.className = `action-indicator action-${action} visible`;

    // Remove after animation
    setTimeout(() => {
      el.classList.remove('visible');
    }, 2000);
  }

  showLevelUpBanner(level, blinds) {
    const banner = document.getElementById('level-banner');
    document.getElementById('banner-level').textContent = `Level ${level}`;
    document.getElementById('banner-blinds').textContent =
      `Blinds: $${blinds.sb.toLocaleString()} / $${blinds.bb.toLocaleString()}`;
    banner.classList.add('visible');
    setTimeout(() => {
      banner.classList.remove('visible');
    }, 3000);
  }

  showTournamentResults(finalState) {
    const modal = document.getElementById('results-modal');
    const players = [...(finalState.players || [])];

    // Sort by elimination order (last eliminated = highest place)
    // Players still in have chips; those with most chips rank higher
    players.sort((a, b) => (b.chips || 0) - (a.chips || 0));

    const humanPlace = players.findIndex(p => p.seatIndex === 0) + 1;

    let titleText = 'Tournament Complete';
    if (humanPlace === 1) titleText = 'You Win!';

    document.getElementById('results-title').textContent = titleText;
    document.getElementById('results-placement').textContent =
      `You finished in ${humanPlace}${getOrdinalSuffix(humanPlace)} place`;

    const standingsEl = document.getElementById('results-standings');
    standingsEl.innerHTML = '';
    players.forEach((p, i) => {
      const row = document.createElement('div');
      row.className = 'standing-row';
      row.innerHTML = `
        <span class="place">${i + 1}${getOrdinalSuffix(i + 1)}</span>
        <span class="name">${this._escapeHtml(p.name || `Seat ${p.seatIndex}`)}</span>
        <span class="chips">$${(p.chips || 0).toLocaleString()}</span>
      `;
      if (p.seatIndex === 0) row.style.color = 'var(--gold)';
      standingsEl.appendChild(row);
    });

    modal.classList.add('visible');
  }

  highlightWinner(seatIndex) {
    const seatEl = document.getElementById(`seat-${seatIndex}`);
    if (seatEl) {
      seatEl.classList.add('winner');
      setTimeout(() => seatEl.classList.remove('winner'), 3000);
    }
  }
}

// ===== SVG Card Rendering =====

function renderCard(card, large) {
  if (!card || !card.rank || !card.suit) return '';

  const w = large ? 90 : 62;
  const h = large ? 128 : 89;
  const rank = RANK_DISPLAY[card.rank] || card.rank;
  const suit = SUIT_SYMBOLS[card.suit] || card.suit;
  const color = SUIT_COLORS[card.suit] || '#000';

  const rankSize = large ? 20 : 17;
  const cornerSuitSize = large ? 17 : 14;
  const centerSuitSize = large ? 42 : 32;

  return `<svg width="${w}" height="${h}" viewBox="0 0 70 100" xmlns="http://www.w3.org/2000/svg">
    <rect x="1" y="1" width="68" height="98" rx="6" ry="6"
      fill="white" stroke="#bbb" stroke-width="1.5"/>
    <text x="5" y="${rankSize + 2}" font-size="${rankSize}" font-weight="800"
      fill="${color}" font-family="Georgia, serif">${rank}</text>
    <text x="5" y="${rankSize + cornerSuitSize + 4}" font-size="${cornerSuitSize}"
      fill="${color}" font-family="serif">${suit}</text>
    <text x="35" y="60" font-size="${centerSuitSize}" text-anchor="middle" dominant-baseline="middle"
      fill="${color}" font-family="serif">${suit}</text>
    <g transform="rotate(180, 35, 50)">
      <text x="5" y="${rankSize + 2}" font-size="${rankSize}" font-weight="800"
        fill="${color}" font-family="Georgia, serif">${rank}</text>
      <text x="5" y="${rankSize + cornerSuitSize + 4}" font-size="${cornerSuitSize}"
        fill="${color}" font-family="serif">${suit}</text>
    </g>
  </svg>`;
}

function renderCardBack() {
  return `<svg width="62" height="89" viewBox="0 0 70 100" xmlns="http://www.w3.org/2000/svg">
    <rect x="1" y="1" width="68" height="98" rx="6" ry="6"
      fill="#1a237e" stroke="#0d1642" stroke-width="1.5"/>
    <rect x="5" y="5" width="60" height="90" rx="3" ry="3"
      fill="none" stroke="#3949ab" stroke-width="0.8"/>
    <line x1="5" y1="5" x2="65" y2="95" stroke="#283593" stroke-width="0.3" opacity="0.5"/>
    <line x1="15" y1="5" x2="65" y2="80" stroke="#283593" stroke-width="0.3" opacity="0.5"/>
    <line x1="25" y1="5" x2="65" y2="65" stroke="#283593" stroke-width="0.3" opacity="0.5"/>
    <line x1="35" y1="5" x2="65" y2="50" stroke="#283593" stroke-width="0.3" opacity="0.5"/>
    <line x1="45" y1="5" x2="65" y2="35" stroke="#283593" stroke-width="0.3" opacity="0.5"/>
    <line x1="5" y1="20" x2="55" y2="95" stroke="#283593" stroke-width="0.3" opacity="0.5"/>
    <line x1="5" y1="35" x2="45" y2="95" stroke="#283593" stroke-width="0.3" opacity="0.5"/>
    <line x1="5" y1="50" x2="35" y2="95" stroke="#283593" stroke-width="0.3" opacity="0.5"/>
    <line x1="5" y1="65" x2="25" y2="95" stroke="#283593" stroke-width="0.3" opacity="0.5"/>
    <line x1="65" y1="5" x2="5" y2="95" stroke="#283593" stroke-width="0.3" opacity="0.5"/>
    <line x1="55" y1="5" x2="5" y2="80" stroke="#283593" stroke-width="0.3" opacity="0.5"/>
    <line x1="45" y1="5" x2="5" y2="65" stroke="#283593" stroke-width="0.3" opacity="0.5"/>
    <line x1="35" y1="5" x2="5" y2="50" stroke="#283593" stroke-width="0.3" opacity="0.5"/>
    <line x1="25" y1="5" x2="5" y2="35" stroke="#283593" stroke-width="0.3" opacity="0.5"/>
    <line x1="65" y1="20" x2="15" y2="95" stroke="#283593" stroke-width="0.3" opacity="0.5"/>
    <line x1="65" y1="35" x2="25" y2="95" stroke="#283593" stroke-width="0.3" opacity="0.5"/>
    <line x1="65" y1="50" x2="35" y2="95" stroke="#283593" stroke-width="0.3" opacity="0.5"/>
    <line x1="65" y1="65" x2="45" y2="95" stroke="#283593" stroke-width="0.3" opacity="0.5"/>
    <text x="35" y="56" font-size="20" text-anchor="middle" fill="#3f51b5" opacity="0.6"
      font-family="serif">&#9824;</text>
  </svg>`;
}

function getOrdinalSuffix(n) {
  const s = ['th', 'st', 'nd', 'rd'];
  const v = n % 100;
  return s[(v - 20) % 10] || s[v] || s[0];
}

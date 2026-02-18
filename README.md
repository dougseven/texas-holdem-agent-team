# Texas Hold'em: Persona Edition

A psychologically realistic single-player Texas Hold'em tournament experience powered by AI-driven NPC personas. Play against 15 distinct personality archetypes—from tight rocks to aggressive maniacs—in a high-fidelity browser-based poker simulator.

## 🎮 Overview

Texas Hold'em: Persona Edition is a single-table tournament (STT) poker game where the challenge comes not just from the cards, but from reading and exploiting 9 unique AI opponents with distinct personalities. Each NPC is powered by advanced persona modeling to create authentic, predictable-yet-realistic opponents that feel like real players.

**Key Highlights:**
- **10-player tournament** (1 human, 9 AI)
- **15 unique NPC personas** with psychological depth
- **$5,000 starting chips** with no rebuys
- **Tournament blind escalation** based on active play time
- **Modern, reactive UI** with smooth animations
- **Zero external dependencies** (pure HTML/CSS/JavaScript)

## ✨ Features

### Rich NPC Personalities
Each NPC is defined by a distinct archetype with consistent behavioral patterns:
- **The Rocks** (Ultra-tight, folding players)
- **The Fish** (Loose, passive players who call everything)
- **The Maniacs** (Aggressive, reckless players)
- **The Sharks** (Skilled, balanced players)
- **Psychological Types** (Tilt-prone, chatty, superstitious, etc.)

Learn to recognize patterns and exploit each player's weaknesses.

### Strategic Gameplay
- **Hand Strength Evaluation**: Full poker hand ranking engine (High Card through Royal Flush)
- **Blind Structure**: 5-minute escalation intervals that reward active play timing
- **Realistic Tournament Flow**: Standard button/small blind/big blind rotation
- **Chip Economy**: Track stack sizes and make tournament-critical decisions

### Interactive UI
- **10-seat table visualization** with player positioning
- **Real-time chip animations** and card presentations
- **Action indicators** showing who's thinking, betting, or folded
- **HUD display** with tournament clock and blind information
- **Responsive design** works on modern browsers

## 🚀 Getting Started

### Quick Start
1. Open `index.html` in a modern web browser
2. Enter your Gemini API Key on the config screen
3. Click "Start Tournament"
4. Play against 9 randomly selected NPC personas and try to win the tournament!

### Requirements
- Modern browser with ES6+ support (Chrome, Firefox, Safari, Edge)
- JavaScript enabled
- No installation or dependencies required

## 🎯 Game Mechanics

### Tournament Structure
- **Format**: Single Table Tournament (STT)
- **Players**: 10 total (1 human, 9 AI)
- **Stack**: $5,000 starting chips per player
- **Rebuys**: None (tournament ends when 1 player remains)

### Blind Escalation
- **Starting Blinds**: $25/$50
- **Timing**: Every 5 minutes of active play time (not real-time)
- **Schedule**: 12 blind levels ranging from $25/$50 to $2,000/$4,000

### Hand Evaluation
- **Best 5-card hand** selected from 7 available cards (hole cards + community)
- **Kicker-based tie-breaking** for hands of same rank
- **Hand Rankings**:
  1. Royal Flush (A-K-Q-J-10, all same suit)
  2. Straight Flush (five consecutive cards, same suit)
  3. Four of a Kind
  4. Full House (three of a kind + pair)
  5. Flush (five cards same suit)
  6. Straight (five consecutive cards)
  7. Three of a Kind
  8. Two Pair
  9. One Pair
  10. High Card

## 🤖 NPC Personas (15 Archetypes)

### The Fish 🐟 (Loose-Passive)
- **Barnacle Bill** - Calling Station (VPIP: 55%)
- **Mr. Moneybags** - Whale (VPIP: 85%)
- **Lucky Larry** - Superstitious (VPIP: 40%)

### The Rocks 🪨 (Tight-Passive)
- **Earl** - Old Coffee Rock (VPIP: 6%)
- **Scaredy Cat Sarah** - Nit (VPIP: 12%)
- **Trapper Tom** - Set Miner (VPIP: 8%)

### The Maniacs 💥 (Loose-Aggressive)
- **Psycho Sid** - Agent of Chaos (VPIP: 75%)
- **Big Stack Ben** - Bully (VPIP: 35%)
- **Internet Kid** - LAG Pro (VPIP: 28%)

### The Sharks 🦈 (Tight-Aggressive)
- **Calculator Cal** - Math Whiz (VPIP: 24%)
- **Officer Dan** - Sheriff/Bluff-Catcher (VPIP: 22%)

### Specialized Types 🎭
- **Angry Andy** - Tilter (Variable based on tilt state)
- **Chatty Cathy** - Speech Player (VPIP: 30%)
- **Copycat Carl** - Mirror (Adapts to table)
- **First Timer Fiona** - Newbie (VPIP: 45%, Random)

See [resources/npc-personas.md](resources/npc-personas.md) for detailed persona profiles and exploitation strategies.

## 💾 Project Structure

```
texas-holdem-agent-team/
├── index.html                      # Main UI (HTML/CSS/JS)
├── README.md                       # This file
├── src/
│   ├── engine.js                  # Poker game logic & hand evaluation
│   ├── npc.js                     # NPC personas & behavior engine
│   └── ui.js                      # Game interface & rendering
└── resources/
    ├── texas-hold-em-prd.md       # Product Requirements Document
    ├── npc-personas.md            # Detailed persona definitions
    └── texas-holdem-rules.md      # Complete poker rules reference
```

### Core Modules

**[engine.js](src/engine.js)** - Poker Game Engine (820 lines)
- Deck creation and shuffling
- Hand evaluator with full ranking system
- Game state management
- Player elimination logic
- Blind schedule management

**[npc.js](src/npc.js)** - NPC Persona Engine (805 lines)
- 15 persona definitions with playstyle stats
- Decision-making logic for NPC actions
- Chat generation and interaction
- Behavior randomization for realism

**[ui.js](src/ui.js)** - User Interface Controller (574 lines)
- 10-seat table rendering and positioning
- Real-time game state visualization
- Player action buttons and interaction
- Chip and card animations
- Tournament clock and blind display

## 🎓 How to Read the Game

Understanding NPC behavior is the key to winning:

1. **Track Ranges**: Note which hands each player raises/calls with
2. **Identify Patterns**: 
   - Does Earl only raise with premium hands?
   - Does Psycho Sid raise from every position?
   - Does Sarah fold to aggression?
3. **Exploit Weaknesses**:
   - Value-bet heavily against calling stations
   - Steal blinds from tight players
   - Let maniacs bluff themselves out
   - Be cautious against balanced players
4. **Position Awareness**: Use button and position advantage to apply pressure
5. **Stack Awareness**: Adjust strategy as stack sizes change throughout tournament

## 🛠 Technical Details

### Architecture
- **Single HTML file** containing all code and styles
- **ES Modules** for code organization (imported as scripts)
- **No external dependencies** (no jQuery, React, etc.)
- **Vanilla JavaScript** throughout

### Browser APIs Used
- DOM manipulation (querySelector, innerHTML, classList)
- CSS Grid & Flexbox for layout
- CSS custom properties (variables) for theming
- setTimeout/setInterval for animations
- fetch() API (for potential AI integration)

### Performance
- Async/await for non-blocking operations
- Efficient DOM updates with batched changes
- CSS animations for smooth visual feedback
- Minimal memory footprint

## 📖 Learning Resources

- [Texas Hold'em Rules](resources/texas-holdem-rules.md) - Complete rules reference
- [NPC Personas](resources/npc-personas.md) - Detailed personality guide with exploitation strategies
- [Product Requirements](resources/texas-hold-em-prd.md) - Design and feature specification

## 🎮 Gameplay Tips

### Early Tournament
- Play tight, build bankroll on premium hands
- Observe each opponent's playstyle
- Take advantage of loose players' mistakes

### Mid Tournament
- Apply pressure on short stacks
- Steal blinds from tight players
- Adjust exploits based on observed patterns

### Late Tournament
- Open your range as players get eliminated
- Use aggression to accumulate chips
- Watch for tilted opponents (Angry Andy)

### Key Strategies by Opponent Type
- **vs Calling Stations**: Only value-bet strong hands, never bluff
- **vs Rocks**: Steal blinds relentlessly
- **vs Maniacs**: Wait for hands, let them bluff into you
- **vs Sharks**: Play straightforward poker, avoid fancy plays

## 🚀 Future Enhancements

Potential directions for expansion:
- AI persona integration (Gemini API for more realistic decisions)
- Multi-table tournaments
- Hand history replay and analysis
- Difficulty levels with curated persona selections
- Statistics tracking and player insights
- Chat system with persona-appropriate responses

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 👨‍💻 Contributing

To contribute to this project:
1. Review the [PRD](resources/texas-hold-em-prd.md) for architectural vision
2. Examine the persona definitions to understand design philosophy
3. Follow the modular code structure (separate concerns in engine/npc/ui)
4. Test thoroughly across different browser environments

---

**Play Smart. Read People. Win Chips.**

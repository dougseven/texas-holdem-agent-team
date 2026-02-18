# **Texas Hold'em Tournament: AI Development Specification**

This document outlines the formal rules and logical structures for a No-Limit Texas Hold'em tournament. These specifications are intended to guide AI Agent Teams in developing the game engine, dealer logic, and player state management.

## **1\. Tournament Foundation**

* **Buy-in:** $5,000 (starting stack of 5,000 tournament chips).  
* **Format:** No-Limit Texas Hold'em (NLH).  
* **Game Type:** Freezeout (no rebuys or add-ons).  
* **Table Constraint:** Single table with a maximum of 10 players.  
* **Starting Blinds:** Level 1 at $25 / $50.

## **2\. Chip Denominations (Digital)**

While the game is digital, the engine should track chip counts precisely. For UI/UX purposes, the following values represent the standard units:

* **Green:** $25  
* **Black:** $100  
* **Purple:** $500  
* **Yellow:** $1,000

## **3\. Blind Structure & Levels**

Blinds increase every **3 minutes**. There are no scheduled breaks. The AI must track a "Level Timer" and transition states automatically at the end of each hand once the timer expires.

| Level | Small Blind | Big Blind | Ante (BB Ante) |
| :---- | :---- | :---- | :---- |
| 1 | $25 | $50 | \- |
| 2 | $50 | $100 | \- |
| 3 | $75 | $150 | \- |
| 4 | $100 | $200 | \- |
| 5 | $150 | $300 | \- |
| 6 | $200 | $400 | $400 |
| 7 | $300 | $600 | $600 |
| 8 | $400 | $800 | $800 |
| 9 | $600 | $1,200 | $1,200 |
| 10 | $1,000 | $2,000 | $2,000 |
| 11 | $1,500 | $3,000 | $3,000 |
| 12 | $2,000 | $4,000 | $4,000 |

## **4\. Gameplay Logic & Procedures**

### **4.1. Seating & The Button**

* **Randomization:** Players are assigned to seats 1 through 10 randomly at the start of the tournament.  
* **The Dealer Button:** In the first hand, the button is determined by dealing one card to each player; high card gets the button. The button moves clockwise one position after every hand.

### **4.2. Betting Rounds**

Each hand consists of four distinct betting rounds:

1. **Pre-Flop:** Two hole cards dealt to each player. Action starts left of the Big Blind (UTG).  
2. **The Flop:** Three community cards dealt. Action starts left of the button.  
3. **The Turn:** One community card dealt. Action starts left of the button.  
4. **The River:** One final community card dealt. Action starts left of the button.

### **4.3. Standard Actions**

* **Check:** Passing the action to the next player (only if no bet has been made).  
* **Bet/Raise:** The minimum raise must be at least the size of the previous bet or raise in that round.  
* **Call:** Matching the current highest bet.  
* **Fold:** Discarding the hand and forfeiting interest in the pot.

### **4.4. The Showdown & Hand Rankings**

If two or more players remain after the River, they reveal hands. The best 5-card hand wins.

* **Rankings (High to Low):** Royal Flush \> Straight Flush \> 4-of-a-Kind \> Full House \> Flush \> Straight \> 3-of-a-Kind \> Two Pair \> One Pair \> High Card.  
* **Split Pots:** If hands are identical, the pot is divided equally. "Odd" chips (if any) go to the player left of the button.

## **5\. Technical Rules for AI Implementation**

### **5.1. All-In & Side Pots**

If a player goes "All-In" with fewer chips than the current bet, a **Side Pot** must be created.

* **Logic:** The All-In player is only eligible for the portion of the pot they contributed to. Any further betting by other players goes into a side pot that the All-In player cannot win.

### **5.2. Player Elimination**

* A player is eliminated when their chip count reaches zero.  
* **Tie-Breaking:** If two players are eliminated in the same hand, the player who started the hand with more chips receives the higher finishing rank.

### **5.3. Moving Blinds (The "Dead Button" Rule)**

The Small Blind and Big Blind must always be posted.

* If the player who was supposed to be Small Blind is eliminated, the button may stay in the same position for one hand (Dead Button) to ensure the next player isn't "skipped" for their Big Blind.

## **6\. AI Agent Directives**

* **Dealer Agent:** Must manage pot calculations, detect hand rankings, move the button, and handle all-in side pot logic.  
* **Timer Agent:** Must track the 3-minute level duration and signal the Dealer Agent when blinds increase. Blinds increase at the *start* of the next hand following timer expiration.  
* **Validation Agent:** Must ensure all raises meet the "minimum raise" rule (PreviousRaise + (CurrentRaise - PreviousRaise)).
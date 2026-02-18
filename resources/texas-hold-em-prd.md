# **PRD: Texas Hold'em Persona Edition (Tournament Style)**

## **1\. Strategic Context & Summary**

**Project Vision:** To create the most psychologically realistic single-player Texas Hold'em experience available in a browser.

**Objective:** Deliver a high-fidelity tournament simulation where the challenge arises not just from the cards, but from the 15 unique AI playstyles (Personas).

**Key Success Factor:** The "Persona Matrix" must feel distinct and reactive to player actions, creating a "live table" atmosphere.

### **Core Mechanics Recap:**

* **Format:** 10-player Single Table Tournament (STT).  
* **Economy:** $5,000 starting chips; No rebuys.  
* **Progression:** $25/$50 starting blinds; 5-minute escalation intervals based on **Active Play Time**.  
* **Persona Engine:** Powered by **Google Vertex AI (Gemini 2.5)**.  
* **Obfuscation:** NPC personas are hidden behind randomly generated names.

## **2\. Current State / Problem Statement**

**The "Static AI" Gap:** Most browser-based single-player poker games utilize "Optimal Math" AI or "Randomized" AI. These models fail to capture the human element of poker—such as "Barnacle Bill's" refusal to fold or "Psycho Sid's" aggressive bluffs.

**User Impact:** For the intermediate-to-advanced player, standard AI becomes predictable and boring. There is no incentive to "read" the opponent.

**Desired Outcome:** By implementing a persona-driven engine using Gemini 2.5, we solve for player retention and immersion.

## **3\. User Personas**

### **Primary: The Psychological Competitor ("The Reader")**

* **Motivation:** Enjoys the "game within the game." Wants to figure out if an opponent is bluffing or "tilted."  
* **Needs:** Consistency in NPC behavior (e.g., if a persona is "The Nit," they must behave like one consistently) and high-quality visual cues.  
* **Pain Points:** Playing against "perfect" bots that never show personality.

### **Secondary: The Casual Improver**

* **Motivation:** Wants to practice tournament play without financial risk.  
* **Needs:** A realistic blind structure and the ability to learn how to handle different player archetypes (e.g., learning to exploit a "Calling Station").

## **4\. Objectives / Opportunities**

* **Objective 1: Behavioral Fidelity.** Achieve a 90% "persona consistency" score where the Gemini 2.5 API correctly executes actions aligned with provided persona stats.  
* **Objective 2: Immersive Communication.** Enable NPC chat that feels contextual to the hand, triggered by the player or significant game events.  
* **Opportunity: Data-Driven Difficulty.** Use persona mixes to create varied table difficulties (e.g., "The Shark Tank" vs. "The Fish Pond").

## **5\. KPIs / Metrics**

### **Primary Metrics**

* **Average Session Length (ASL):** Targeted increase of 30% over non-persona poker apps.  
* **Persona Recognition Accuracy:** Can players correctly identify a "Maniac" vs. a "Rock" by the end of the session?  
* **Tournament Completion Rate (TCR):** Percentage of players who play until elimination or victory.

### **Secondary Metrics**

* **Gemini API Latency:** p95 response time for decisions should be \< 2.0 seconds.  
* **VPIP/PFR Variance:** Tracking if NPC in-game behavior matches their defined persona stats over time.

### **The "Kill" Metric (Threshold for Pivot)**

* **API Cost Efficiency:** If the average cost per completed tournament session exceeds $0.50 USD in Vertex AI tokens, the project will pivot to a hybrid model (Local JS logic for simple folds, Gemini for post-flop play).

## **6\. Desired End-to-End Experience**

### **6.1 Tournament Initialization**

1. **Table Setup:** 10 Seats. 1 Human Player, 9 NPCs.  
2. **Persona Assignment:** 9 personas randomly selected from the 15-persona pool.  
3. **Obfuscation:** NPCs assigned random names to hide their archetype.  
4. **Dealer Draw:** High card receives the Button (![][image1]); standard ![][image2] and ![][image3] assignment follows.

### **6.2 The Gameplay Loop**

1. **Gemini API Interaction:** On an NPC's turn, context (Persona, chip counts, hand history, hole cards) is sent to Gemini 2.5.  
2. **Betting Action:** Gemini returns a structured action (Fold, Call, Raise) and optional chat.  
3. **Visual Feedback:** "Thinking" indicators mask API latency; fluid chip and card animations follow.

### **6.3 Clock & Blind Management**

* **Active Play Timer:** Decrements only during active hand state.  
* **Escalation:** Every 5 minutes of active play, blinds increase according to the tournament schedule.

### **6.4 The "Social" Layer**

* **Player Chat:** User chooses from "Preset" categories (Friendly, Tactical, Reactionary).  
* **NPC Response:** Gemini processes player input against the NPC's specific persona traits and chat frequency weightings.

### **6.5 User Story & Acceptance Criteria (Gherkin)**

* **Scenario 1:** Blind Escalation via Active Play Time.  
* **Scenario 2:** Gemini 2.5 NPC Decision Logic.  
* **Scenario 3:** Weighted Persona Chat.

## **7\. Technical Requirements**

### **7.1 Architecture & Performance**

* **Single-File Delivery:** HTML/JS/CSS bundle.  
* **Asynchronous AI Handling:** Non-blocking async/await for API calls.

### **7.2 Persona Engine (Vertex AI / Gemini 2.5)**

* **Persona Memory:** Maintains a "Session Log" per NPC to track player history.  
* **Weighted Chat Probability:** \* **High (40-60%):** Chatty Cathy, Psycho Sid.  
  * **Low (2-5%):** Earl, Calculator Cal.

### **7.3 Asset Requirements**

* **SVG Rendering:** For cards and chips.

## **9\. Architecture & System Flow**

1. **Frontend View (React/Vanilla):** Manages animations, timer, and user input.  
2. **Game Engine:** Core poker logic (hand evaluation, pot management, turn order).  
3. **Decision Controller:** \* Intercepts NPC turns.  
   * If Hand Strength \< 15% pre-flop, execute **Local Fast-Fold**.  
   * Otherwise, package context and call **Gemini 2.5 Persona API**.  
4. **Context Condenser:** Compresses table history into tokens to minimize API cost.

## **10\. Timeline & Milestones**

* **Phase 1: Foundation:** HTML5 Canvas/SVG poker board, hand evaluator, and basic tournament loop.  
* **Phase 2: Brain Surgery:** Vertex AI integration. Refinement of "Persona Prompts" and "Decision Logs."  
* **Phase 3: Personality Polish:** Implementation of weighted chat, blind timer logic, and NPC obfuscation.  
* **Phase 4: Launch:** Performance tuning and responsive design for mobile browsers.

## **11\. Testing & Rollout Plan**

* **Simulation Testing:** Run 1,000 automated games with 10 NPCs to verify VPIP/PFR consistency against persona stats.  
* **Persona Blind Test:** User testing where players try to "label" NPCs with their persona archetype after 20 hands.  
* **Latency Stress Test:** Measuring UI responsiveness under 3G/Slow-LTE network conditions.

## **12\. Monitoring & Alerting**

* **Token Burn Alert:** Automated notification if daily API usage exceeds the project budget.  
* **Sentiment Analysis:** Monitoring Gemini chat outputs to ensure NPCs remain "in-character" and do not violate safety guidelines.

## **13\. RAID (Risks, Assumptions, Issues, Dependencies)**

* **Risk:** API Latency/Cost. (Mitigation: Auto-fold logic for weak hands).  
* **Assumption:** Active Play Timer is preferred over wall-clock time.  
* **Dependency:** Google Vertex AI API availability.
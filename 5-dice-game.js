const state = {
  dice: [1,1,1,1,1], held: [false,false,false,false,false],
  rollsLeft: 3, turn: 1, maxTurns: 13,
  scores: {}, totalScore: 0, gameOver: false
};

const categories = [
  { id:'ones', name:'一点', calc: d => d.filter(x=>x===1).length },
  { id:'twos', name:'两点', calc: d => d.filter(x=>x===2).length * 2 },
  { id:'threes', name:'三点', calc: d => d.filter(x=>x===3).length * 3 },
  { id:'fours', name:'四点', calc: d => d.filter(x=>x===4).length * 4 },
  { id:'fives', name:'五点', calc: d => d.filter(x=>x===5).length * 5 },
  { id:'sixes', name:'六点', calc: d => d.filter(x=>x===6).length * 6 },
  { id:'threeKind', name:'三条', calc: d => { const c=count(d); return c.some(x=>x>=3) ? d.reduce((a,b)=>a+b,0) : 0; }},
  { id:'fourKind', name:'四条', calc: d => { const c=count(d); return c.some(x=>x>=4) ? d.reduce((a,b)=>a+b,0) : 0; }},
  { id:'fullHouse', name:'满堂红', calc: d => { const c=count(d).sort((a,b)=>b-a); return (c[0]===3&&c[1]===2)||c[0]===5 ? 25 : 0; }},
  { id:'smallStraight', name:'小顺子', calc: d => hasStraight(d,4) ? 30 : 0 },
  { id:'largeStraight', name:'大顺子', calc: d => hasStraight(d,5) ? 40 : 0 },
  { id:'yahtzee', name:'五同', calc: d => count(d).some(x=>x===5) ? 50 : 0 },
  { id:'chance', name:'机会', calc: d => d.reduce((a,b)=>a+b,0) }
];

const count = arr => Object.values(arr.reduce((a,v)=>{a[v]=(a[v]||0)+1;return a;},{}));
const hasStraight = (dice, len) => {
  const s = [...new Set(dice)].sort((a,b)=>a-b);
  for(let i=0; i<=s.length-len; i++) {
    let seq = true;
    for(let j=1; j<len; j++) if(s[i+j]!==s[i]+j){seq=false;break;}
    if(seq) return true;
  }
  return false;
};

const els = {
  diceArea: document.querySelector('.dice-area'),
  rollBtn: document.getElementById('roll-btn'),
  rollsLeft: document.getElementById('rolls-left'),
  turn: document.getElementById('turn'),
  scoreBody: document.getElementById('score-body'),
  totalScore: document.getElementById('total-score'),
  newGameBtn: document.getElementById('new-game-btn')
};

function init() {
  renderDice(); renderScoreSheet(); updateUI();
  els.rollBtn.addEventListener('click', rollDice);
  els.newGameBtn.addEventListener('click', newGame);
  els.diceArea.addEventListener('click', e => {
    if(e.target.classList.contains('hold-btn') && state.rollsLeft < 3) {
      const idx = parseInt(e.target.dataset.index);
      state.held[idx] = !state.held[idx]; renderDice();
    }
  });
  els.scoreBody.addEventListener('click', e => {
    if(e.target.classList.contains('score-btn') && !e.target.disabled) {
      const id = e.target.dataset.id;
      const cat = categories.find(c=>c.id===id);
      if(cat && !state.scores.hasOwnProperty(id)) {
        state.scores[id] = cat.calc(state.dice);
        state.totalScore = Object.values(state.scores).reduce((a,b)=>a+b,0);
        nextTurn();
      }
    }
  });
}

function renderDice() {
  els.diceArea.querySelectorAll('.die').forEach((el, i) => {
    el.className = `die ${state.held[i]?'held':''}`;
    el.innerHTML = `⚀⚁⚂⚃⚄⚅`.charAt(state.dice[i]-1) + 
      `<button class="hold-btn" data-index="${i}">${state.held[i]?'解除':'保留'}</button>`;
  });
}

function rollDice() {
  if(state.rollsLeft <= 0 || state.gameOver) return;
  for(let i=0; i<5; i++) if(!state.held[i]) state.dice[i] = Math.floor(Math.random()*6)+1;
  state.rollsLeft--; renderDice(); updateUI(); renderScoreSheet();
}

function renderScoreSheet() {
  els.scoreBody.innerHTML = '';
  categories.forEach(cat => {
    const used = state.scores.hasOwnProperty(cat.id);
    const potential = used ? state.scores[cat.id] : cat.calc(state.dice);
    const row = document.createElement('tr');
    row.innerHTML = `
      <td>${cat.name}</td>
      <td>${used ? state.scores[cat.id] : (potential || '-')}</td>
      <td><button class="score-btn" data-id="${cat.id}" ${used || state.rollsLeft===3 || state.gameOver ? 'disabled' : ''}>${used?'已选':'选择'}</button></td>`;
    els.scoreBody.appendChild(row);
  });
}

function updateUI() {
  els.rollsLeft.textContent = state.rollsLeft;
  els.turn.textContent = state.turn;
  els.totalScore.textContent = state.totalScore;
  els.rollBtn.disabled = state.rollsLeft === 0 || state.gameOver;
}

function nextTurn() {
  if(state.turn >= state.maxTurns) {
    state.gameOver = true;
    setTimeout(() => alert(`🎉 游戏结束！最终得分: ${state.totalScore}`), 100);
    updateUI(); return;
  }
  state.turn++; state.rollsLeft = 3; state.held = [false,false,false,false,false]; state.dice = [1,1,1,1,1];
  renderDice(); renderScoreSheet(); updateUI();
}

function newGame() {
  state.dice=[1,1,1,1,1]; state.held=[false,false,false,false,false];
  state.rollsLeft=3; state.turn=1; state.scores={}; state.totalScore=0; state.gameOver=false;
  renderDice(); renderScoreSheet(); updateUI();
}

window.addEventListener('DOMContentLoaded', init);

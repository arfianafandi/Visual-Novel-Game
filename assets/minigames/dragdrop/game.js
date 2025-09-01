(function(){
  // --- Data set: pair items -> zones ---
  const PAIRS = [
    { id: 'apel', label: '🍎 Apel', zone: 'buah' },
    { id: 'pisang', label: '🍌 Pisang', zone: 'buah' },
    { id: 'wortel', label: '🥕 Wortel', zone: 'sayur' },
    { id: 'brokoli', label: '🥦 Brokoli', zone: 'sayur' },
    { id: 'kucing', label: '🐱 Kucing', zone: 'hewan' },
    { id: 'anjing', label: '🐶 Anjing', zone: 'hewan' },
  ];

  const ZONES = [
    { id: 'buah', label: 'Buah' },
    { id: 'sayur', label: 'Sayur' },
    { id: 'hewan', label: 'Hewan' },
  ];

  // --- Elements ---
  const elItems = document.querySelector('.items');
  const elZones = document.querySelector('.zones');
  const elScore = document.getElementById('score');
  const elTotal = document.getElementById('total');
  const elTime = document.getElementById('time');
  const elReset = document.getElementById('resetBtn');
  const elToast = document.getElementById('toast');

  let score = 0;
  let total = PAIRS.length;
  let timer = 60;
  let tickHandle = null;

  elTotal.textContent = String(total);

  function shuffle(arr){
    for (let i = arr.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    return arr;
  }

  function toast(msg){
    elToast.textContent = msg;
    elToast.classList.add('show');
    clearTimeout(elToast._t);
    elToast._t = setTimeout(()=> elToast.classList.remove('show'), 1200);
  }

  function render(){
    // Render items
    elItems.innerHTML = '';
    shuffle([...PAIRS]).forEach(({id, label}) => {
      const d = document.createElement('div');
      d.className = 'card item';
      d.textContent = label;
      d.setAttribute('draggable', 'true');
      d.dataset.itemId = id;
      d.addEventListener('dragstart', onDragStart);
      d.addEventListener('dragend', onDragEnd);
      elItems.appendChild(d);
    });

    // Render zones
    elZones.innerHTML = '';
    ZONES.forEach(({id, label}) => {
      const z = document.createElement('div');
      z.className = 'card zone';
      z.textContent = label;
      z.dataset.zoneId = id;
      z.addEventListener('dragover', onDragOver);
      z.addEventListener('drop', onDrop);
      elZones.appendChild(z);
    });
  }

  function onDragStart(ev){
    ev.dataTransfer.setData('text/plain', ev.currentTarget.dataset.itemId);
    setTimeout(() => ev.currentTarget.style.opacity = '0.6');
  }

  function onDragEnd(ev){
    ev.currentTarget.style.opacity = '1';
  }

  function onDragOver(ev){
    ev.preventDefault();
  }

  function onDrop(ev){
    ev.preventDefault();
    const zoneId = ev.currentTarget.dataset.zoneId;
    const itemId = ev.dataTransfer.getData('text/plain');
    const pair = PAIRS.find(p => p.id === itemId);
    if (!pair) return;

    if (pair.zone === zoneId){
      score++;
      elScore.textContent = String(score);
      ev.currentTarget.classList.add('accept');
      setTimeout(()=> ev.currentTarget.classList.remove('accept'), 400);

      // remove the dragged item from board
      const dragged = [...document.querySelectorAll('.item')].find(el => el.dataset.itemId === itemId);
      if (dragged) dragged.remove();

      toast('Benar!');
      if (score === total){
      // Kirim sinyal selesai ke parent (Monogatari)
      if (window.parent) {
          window.parent.postMessage({ action: 'finished' }, '*');
      }

        stopTimer();
        setTimeout(()=> toast('🎉 Semua cocok!'), 50);
      }
    } else {
      ev.currentTarget.classList.add('wrong');
      setTimeout(()=> ev.currentTarget.classList.remove('wrong'), 400);
      toast('Salah zona');
    }
  }

  function startTimer(){
    stopTimer();
    tickHandle = setInterval(() => {
      timer--;
      elTime.textContent = String(timer);
      if (timer <= 0){
        stopTimer();
        toast('⏰ Waktu habis!');
        // disable dragging
        document.querySelectorAll('.item').forEach(el => el.setAttribute('draggable','false'));
      }
    }, 1000);
  }

  function stopTimer(){
    if (tickHandle){
      clearInterval(tickHandle);
      tickHandle = null;
    }
  }

  function reset(){
    score = 0;
    elScore.textContent = '0';
    timer = 60;
    elTime.textContent = String(timer);
    render();
    startTimer();
  }

  elReset.addEventListener('click', reset);

  // init
  render();
  startTimer();
})();
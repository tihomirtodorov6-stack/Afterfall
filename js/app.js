// app.js - логика за Letishta.bg
const listEl = document.getElementById('airports-list');
const detailEl = document.getElementById('airport-detail');
const searchEl = document.getElementById('search-airports');

function renderList(filter = "") {
  if (!listEl) return;
  listEl.innerHTML = "";
  const filtered = airports.filter(a => 
    (a.name + a.code + a.city).toLowerCase().includes(filter.toLowerCase())
  );
  filtered.forEach(a => {
    const card = document.createElement('div');
    card.className = 'airport-card';
    card.onclick = () => showAirport(a.id);
    card.innerHTML = `
      <div class="card-top"><span>${a.code}</span><span>${a.city}</span></div>
      <h3>${a.name}</h3>
      <div class="kiss">Kiss & Ride: ${a.kissAndRide.freeMinutes} мин безплатно</div>
      <div style="font-size:13px;color:#666;margin-top:6px">Натисни за цени и карта</div>
    `;
    listEl.appendChild(card);
  });
}

window.showAirport = function(id) {
  const a = airports.find(x => x.id === id);
  if (!a) return;
  listEl.style.display = 'none';
  if(searchEl) searchEl.parentElement.style.display = 'none';
  document.querySelector('.hero').style.display = 'none';
  detailEl.style.display = 'block';
  window.scrollTo(0,0);
  
  detailEl.innerHTML = `
    <button class="back-btn" onclick="backToList()">← Назад към всички летища</button>
    <h2>${a.name} (${a.code}) - Такси 2026</h2>
    <p style="color:#555;margin:8px 0 16px">Терминали: ${a.terminals.join(', ')} | Плащане: ${a.payment}</p>
    
    <div class="detail-grid">
      <div class="detail-card warning">
        <h3>🚗 Kiss & Ride / Drop-off</h3>
        <ul>
          <li><b>${a.kissAndRide.freeMinutes} мин безплатно</b></li>
          <li>Локация: ${a.kissAndRide.location}</li>
          <li>След това: ${a.kissAndRide.priceAfter}</li>
          ${a.kissAndRide.warning ? `<li style="color:#b45309"><b>Внимание:</b> ${a.kissAndRide.warning}</li>` : ''}
        </ul>
      </div>
      
      <div class="detail-card highlight">
        <h3>🅿️ Официален паркинг летище</h3>
        <ul>
          ${a.parking.map(p => `<li><b>${p.name}</b> - ${p.price}</li>`).join('')}
        </ul>
      </div>
      
      ${a.privateParking.length ? `
      <div class="detail-card">
        <h3>💰 По-евтина алтернатива</h3>
        <ul>
          ${a.privateParking.map(p => `<li><b>${p.name}</b><br>${p.price}<br><small>${p.transfer || ''} ${p.nightFee || ''}</small></li>`).join('')}
        </ul>
      </div>` : ''}
    </div>

    <div class="calc-box">
      <h3>Калкулатор: Колко ще спестиш?</h3>
      <div style="margin:12px 0">
        Колко дни заминаваш? <input type="number" id="daysInput" value="7" min="1" max="30" onchange="calcSaving('${a.id}')"> дни
      </div>
      <div id="calcResult"></div>
    </div>
  `;
  calcSaving(a.id);
}

window.backToList = function() {
  detailEl.style.display = 'none';
  listEl.style.display = 'grid';
  if(searchEl) searchEl.parentElement.style.display = 'block';
  document.querySelector('.hero').style.display = 'block';
  window.scrollTo(0,0);
}

window.calcSaving = function(id) {
  const a = airports.find(x => x.id === id);
  const days = parseInt(document.getElementById('daysInput')?.value || 7);
  let officialPrice = 0;
  if(id === 'sof') officialPrice = 35;
  else if(id === 'var') officialPrice = 25;
  else if(id === 'boj') officialPrice = 25;
  else officialPrice = 15;
  
  const privatePrice = 12;
  const totalOfficial = officialPrice * days;
  const totalPrivate = privatePrice * days;
  const saving = totalOfficial - totalPrivate;
  
  const res = document.getElementById('calcResult');
  if(res) res.innerHTML = `
    <div>Официален паркинг: <b>${totalOfficial} лв</b> (${officialPrice} лв/ден)</div>
    <div>Частен паркинг: <b>${totalPrivate} лв</b> (${privatePrice} лв/ден)</div>
    <div class="saving" style="margin-top:8px">Спестяваш: ${saving} лв</div>
    <div style="font-size:12px;color:#666;margin-top:6px">*Цените са ориентировъчни. Частните включват трансфер до терминала.</div>
  `;
}

if(searchEl) {
  searchEl.addEventListener('input', (e) => renderList(e.target.value));
}

document.addEventListener('DOMContentLoaded', () => renderList());
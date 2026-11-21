(function () {
  'use strict';
  const $ = id => document.getElementById(id);
  const line = document.body.dataset.line;
  if (!line || !window.FARE_DATA || !window.FARE_DATA[line]) return;
  const data = window.FARE_DATA[line];
  const from = $('from'), to = $('to'), result = $('result'), error = $('error');
  if (!from || !to || !result) return;

  function fill(select, selected) {
    data.stations.forEach((station, i) => {
      const option = document.createElement('option');
      option.value = String(i); option.textContent = station; select.appendChild(option);
    });
    select.value = String(selected);
  }
  function fareAt(matrix, a, b) {
    const lo = Math.min(a,b), hi = Math.max(a,b);
    return matrix?.[lo]?.[hi-lo-1];
  }
  function pesos(n) { return '₱' + Number(n).toFixed(2); }
  function showError(message) {
    error.textContent = message;
    error.classList.add('show');
    result.classList.remove('show');
  }
  function hideResults() { result.classList.remove('show'); error.classList.remove('show'); }
  function calculate() {
    const a = Number(from.value), b = Number(to.value);
    if (a === b) return showError('Please choose two different stations.');
    let fares;
    if (line === 'bus') fares = [data.regular, data.discount];
    if (line === 'mrt') fares = [data.discounted_all];
    if (line === 'lrt1') fares = [data.single, data.stored];
    if (line === 'lrt2') fares = [data.discounted_stored];
    if (!fares) return showError('No fare table is available.');
    const values = fares.map(matrix => fareAt(matrix,a,b));
    if (values.some(v => typeof v !== 'number' || !Number.isFinite(v)))
      return showError('This station pair is not present in the uploaded fare matrix.');
    $('routeText').textContent = `${data.stations[a]} → ${data.stations[b]}`;
    values.forEach((value,i) => { $('amount'+i).textContent = pesos(value); });
    error.classList.remove('show');
    result.classList.add('show');
  }
  fill(from,0);
  fill(to, line==='bus'?6:line==='mrt'?12:line==='lrt1'?24:12);
  $('submit').addEventListener('click', calculate);
  $('swap').addEventListener('click', () => {
    const a=from.value; from.value=to.value; to.value=a; hideResults();
  });
  from.addEventListener('change', hideResults);
  to.addEventListener('change', hideResults);
})();

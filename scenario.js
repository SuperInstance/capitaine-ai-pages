window.SCENARIO = {
  prompt: 'Name the order on the table…',
  decision: 'Should the fleet stand down for the storm window?',
  factors: [
    { label: 'Sea state', weight: 0.95, score: 0.8,  note: 'Nine-footers building. Wind veering.' },
    { label: 'Agent debts open', weight: 0.70, score: -0.5, note: 'Fourteen debts open — three past due.' },
    { label: 'Watch coverage', weight: 0.80, score: -0.3, note: 'Thin at 0200. Nobody rested.' },
    { label: 'Comms latency', weight: 0.50, score: 0.2,  note: 'Satellite lag 900ms and climbing.' },
    { label: 'Mission value', weight: 0.85, score: -0.6, note: 'The survey run pays the quarter.' }
  ],
  seedLog: [
    { kind: 'note', text: 'Storm window posted: 0200–0900. All hands to the board.' },
    { kind: 'note', text: 'Fleet of five reporting. Debts tallied, watches set.' }
  ]
};

window.SKIN_CONFIG = {
  domain: 'capitaine.ai',
  tagline: "The captain's deck.",
  forSaleUrl: '#',
  scenario: window.SCENARIO,
  bands: [
    { min: 0.34, label: 'STAND DOWN', cls: 'go' },
    { min: -0.34, label: 'HOLD WATCH', cls: 'hold' },
    { min: -Infinity, label: 'KEEP STATION', cls: 'nogo' }
  ],
  renderExtra: function (root, api) {
    var fleet = [
      { name: 'halyard-01',  task: 'Chart survey grid C',    status: 'UNDERWAY', cls: 'sk-underway', debts: 4 },
      { name: 'binnacle-02', task: 'Ledger reconciliation',  status: 'WATCHING',  cls: 'sk-watching', debts: 1 },
      { name: 'soundings-03',task: 'Depth probe sweep',      status: 'UNDERWAY',  cls: 'sk-underway', debts: 3 },
      { name: 'taffrail-04', task: 'Comms relay watch',      status: 'STANDBY',   cls: 'sk-standby',  debts: 0 },
      { name: 'leehelm-05',  task: 'Fuel state audit',       status: 'WATCHING',  cls: 'sk-watching', debts: 6 }
    ];

    function totalDebts() {
      return fleet.reduce(function (n, a) { return n + a.debts; }, 0);
    }

    root.innerHTML =
      '<div class="sk-fleet">' +
        '<div class="le-label">Fleet board <span class="le-hint">five agents, one storm window</span></div>' +
        '<table class="sk-fleet-table"><thead><tr>' +
          '<th>Agent</th><th>Task</th><th>Status</th><th style="text-align:right">Open debts</th>' +
        '</tr></thead><tbody data-testid="fleet-body">' +
        fleet.map(function (a) {
          return '<tr><td class="sk-agent">' + a.name + '</td>' +
            '<td>' + a.task + '</td>' +
            '<td><span class="sk-pill ' + a.cls + '">' + a.status + '</span></td>' +
            '<td class="sk-debts">' + a.debts + '</td></tr>';
        }).join('') +
        '</tbody></table>' +
        '<div class="sk-fleet-foot">' +
          '<span class="sk-readiness" data-testid="fleet-readiness"></span>' +
          '<button class="le-btn" data-testid="muster-btn">Muster the fleet</button>' +
        '</div>' +
      '</div>';

    var readiness = root.querySelector('[data-testid="fleet-readiness"]');

    function renderReadiness() {
      if (!api.factors.length) {
        readiness.innerHTML = 'Fleet at stations. <b>Decompose</b> to weigh the storm window.';
        return;
      }
      var v = api.project();
      readiness.innerHTML = 'Fleet carries <b>' + totalDebts() + '</b> open debts · ' +
        'the field projects <b>' + v.band.label + '</b> at ' + (Math.round(v.score * 100) / 100).toFixed(2) + '.';
    }

    renderReadiness();
    api.el.addEventListener('input', renderReadiness);
    var rows = api.el.querySelector('[data-testid="factor-rows"]');
    if (rows) new MutationObserver(renderReadiness).observe(rows, { childList: true });

    root.querySelector('[data-testid="muster-btn"]').addEventListener('click', function () {
      fleet.forEach(function (a) {
        api.addLog('note', 'Muster: ' + a.name + ' reports ' + a.status.toLowerCase() +
          ' — ' + a.task.toLowerCase() + ', ' + a.debts + ' debt' + (a.debts === 1 ? '' : 's') + ' open.');
      });
    });
  }
};

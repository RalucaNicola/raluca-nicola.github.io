(function () {
  var data = [
    { month: 'Jan', mm: 56 }, { month: 'Feb', mm: 48 },
    { month: 'Mar', mm: 61 }, { month: 'Apr', mm: 73 },
    { month: 'May', mm: 95 }, { month: 'Jun', mm: 110 },
    { month: 'Jul', mm: 120 }, { month: 'Aug', mm: 98 },
    { month: 'Sep', mm: 82 }, { month: 'Oct', mm: 70 },
    { month: 'Nov', mm: 65 }, { month: 'Dec', mm: 60 },
  ];
  var months = data.map(function (d) { return d.month; });

  function attach() {
    if (!window.registerPlot) return setTimeout(attach, 30);
    window.registerPlot('rain-2024', function (Plot, _data, ctx) {
      return Plot.plot({
        width: ctx.width,
        height: ctx.height,
        marginLeft: 50,
        x: { domain: months, label: null },
        y: { label: 'precipitation (mm)', grid: true },
        marks: [
          Plot.barY(data, { x: 'month', y: 'mm', fill: 'currentColor', fillOpacity: 0.85 }),
          Plot.ruleY([0]),
        ],
        style: { color: 'var(--accent)' },
      });
    });
  }
  attach();
})();

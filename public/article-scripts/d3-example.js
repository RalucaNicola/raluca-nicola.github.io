(function () {
  function attach() {
    if (!window.registerD3) return setTimeout(attach, 30);
    window.registerD3('scatter-demo', function (svg, _data, ctx) {
      var width = ctx.width, height = ctx.height, d3 = ctx.d3;
      var m = { top: 20, right: 20, bottom: 36, left: 44 };
      var w = width - m.left - m.right;
      var h = height - m.top - m.bottom;
      var rand = d3.randomLcg(42);
      var data = Array.from({ length: 100 }, function () {
        return { x: rand() * 100, y: rand() * 100, r: 3 + rand() * 6 };
      });
      var x = d3.scaleLinear().domain([0, 100]).range([0, w]);
      var y = d3.scaleLinear().domain([0, 100]).range([h, 0]);
      var g = svg.append('g').attr('transform', 'translate(' + m.left + ',' + m.top + ')');
      g.append('g').attr('class', 'axis')
        .attr('transform', 'translate(0,' + h + ')')
        .call(d3.axisBottom(x));
      g.append('g').attr('class', 'axis').call(d3.axisLeft(y));
      g.selectAll('circle')
        .data(data).join('circle')
        .attr('cx', function (d) { return x(d.x); })
        .attr('cy', function (d) { return y(d.y); })
        .attr('r', function (d) { return d.r; })
        .attr('fill', 'var(--accent)')
        .attr('fill-opacity', 0.55)
        .attr('stroke', 'var(--accent)');
    });
  }
  attach();
})();

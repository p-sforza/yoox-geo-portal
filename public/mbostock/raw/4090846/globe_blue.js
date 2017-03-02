  var width = 480,
      height = 480;

  var projection = d3.geo.orthographic()
    .translate([width / 2, height / 2])
    .scale(width / 2 - 20)
    .clipAngle(90)
    .precision(0.6);

  var canvas = d3.select("#globeCanvas").append("canvas")
    .attr("width", width)
    .attr("height", height);

  var c = canvas.node().getContext("2d");

  var path = d3.geo.path()
    .projection(projection)
    .context(c);

  var title = d3.select("h1");

  queue()
    .defer(d3.json, "/mbostock/raw/4090846/world-110m.json")
    .defer(d3.tsv, "/mbostock/raw/4090846/world-country-names.tsv")
    .await(ready);

  function ready(error, world, names) {
    if (error) throw error;

    globe = {type: "Sphere"},
      land = topojson.feature(world, world.objects.land),
      countries = topojson.feature(world, world.objects.countries).features,
      borders = topojson.mesh(world, world.objects.countries, function(a, b) { return a !== b; }),
      i = -1,
      n = countries.length;

    countries = countries.filter(function(d) {
      return names.some(function(n) {
        if (d.id == n.id) return d.name = n.name;
      });
    }).sort(function(a, b) {
      return a.name.localeCompare(b.name);
    });

    }

  function transition(i) {
  	d3.transition()
      .duration(125)
      .tween("rotate", function() {
        var p = d3.geo.centroid(countries[i]),
            r = d3.interpolate(projection.rotate(), [-p[0], -p[1]]);

        title.text(countries[i].name);
        document.getElementById("log").innerHTML = countries[i].name ;

        return function(t) {
          projection.rotate(r(t));
          c.clearRect(0, 0, width, height);
          c.fillStyle = "#ccc", c.beginPath(), path(land), c.fill();

          // Country color!
          //c.fillStyle = "#f00", c.beginPath(), path(countries[i]), c.fill();
          c.fillStyle = "#24179E", c.beginPath(), path(countries[i]), c.fill();
          c.strokeStyle = "#fff", c.lineWidth = .5, c.beginPath(), path(borders), c.stroke();
          c.strokeStyle = "#000", c.lineWidth = 2, c.beginPath(), path(globe), c.stroke();
        };
      })
    }
  
    d3.select(self.frameElement).style("height", height + "px");
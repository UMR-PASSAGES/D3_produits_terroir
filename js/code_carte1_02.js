// Exemples utilisés :
// pour les infobulles : http://bl.ocks.org/lhoworko/7753a11efc189a936371
// pour le zoom/pan : https://bl.ocks.org/mbostock/eec4a6cda2f573574a11

// code javascript de la carte
$(function() {
	init();
});

function init() {
	
	// STRUCTURES
	
	// titre
	var titre = "<p>Superposition des lieux</p>";
	document.getElementById("titre").innerHTML = titre;
	// pied de page
	var footer = "<p>TERESMA - carte 1</p>";
	document.getElementById("footer").innerHTML = footer;

	// DONNEES


	
	// VARIABLES
	var width = 700,
    	height = 700;
    	scale0 = 9000
    	
    zoom = d3.behavior.zoom()
    	.translate([500, 0])
    	.scale(scale0)
    	.on("zoom", zoomed);
    
    svg = d3.select("#carte")
    	.append("svg")
    	.attr("width", width)
    	.attr("height", height);
    	
    tooltip = d3.select('body').append('div')
            .attr('class', 'hidden tooltip');
            
    projection = d3.geo.conicConformal() // Lambert-93
    	.center([2.454071, 47.279229]) // On centre la carte
    	//.scale(6000)
    	//.translate([350, 0]);
 
	path = d3.geo.path()
		.projection(projection);
	
	// échelle de couleur pour les lieux
	color = d3.scale.linear()
		.domain([1, 10])
		.range(["#f7fcf5", "#00441b"]);

	svg
    	.call(zoom)
    	.call(zoom.event);
	
	queue()
    	.defer(d3.json, 'json/fond.geojson')
    	.defer(d3.json, 'json/lieux_aplat.geojson')
    	.await(afficheCarte);
	
	// LANCEMENT
	afficheCarte();
	
}

function zoomed() {
  projection
      .translate(zoom.translate())
      .scale(zoom.scale());

  svg.selectAll("path")
      .attr("d", path);
}


function afficheCarte(error, fond, lieux_aplat) {
	
	if(error) { console.log(error); }
	
	svg.selectAll('path')
		.data(fond.features)
		.enter()
		.append('path')
		.attr("d", path)
		.attr("class", "fond");
	
	svg.selectAll('.lieux_aplat')
				.data(lieux_aplat.features)
				.enter()
				.append('path')
				.attr("d", path)
				.attr("class", "lieux_aplat")
				.style("fill", function (d) {
					var value = d.properties.nb_lieux
					if (value) {
						return color(value)
					} else {
						return "#ccc"
					}
				})
				.on('mousemove', function (d) {
					var mouse = d3.mouse(svg.node()).map(function (d) {
						return parseInt(d);
					});
					tooltip.classed('hidden', false)
						.attr('style', 'left:' + (mouse[0] + 20) + 'px; top:' + (mouse[1] + 20) + 'px')
						.html(d.properties.nb_lieux + ' lieu(x)');
				})
				.on('mouseout', function () {
					tooltip.classed('hidden', true);
				});

}


	
	


	

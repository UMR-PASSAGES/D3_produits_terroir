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
	var titre = "<p>Répartition des produits laitiers</p>";
	document.getElementById("titre").innerHTML = titre;
	// pied de page
	var footer = "<p>TERESMA - carte test</p>";
	document.getElementById("footer").innerHTML = footer;

	// DONNEES


	
	// VARIABLES
	var width = 500,
    	height = 500;
    	//scale0 = (width - 1) / 2 / Math.PI;
    	scale0 = 6000

    zoom = d3.behavior.zoom()
    	//.translate([width / 2, height / 2])
    	//.center([2.454071, 47.279229])
    	.translate([350, 0])
    	.scale(scale0)
    	//.scaleExtent([scale0, 8 * scale0])
    	.on("zoom", zoomed);
    
    svg = d3.select("#carte")
    	.append("svg")
    	.attr("width", width)
    	.attr("height", height);
    	
    tooltip = d3.select('body').append('div')
            .attr('class', 'hidden tooltip');
            
    projection = d3.geo.conicConformal() // Lambert-93
    	.center([2.454071, 47.279229]) // On centre la carte
    	.scale(6000)
    	.translate([350, 0]);
 
	path = d3.geo.path()
		.projection(projection);
	
	// échelle de couleur pour les lieux
	color = d3.scale.linear()
		.domain([1, 10])
		.range(["#f7fcf5", "#00441b"]);

//	g = svg.append("g");

	svg
    	.call(zoom)
    	.call(zoom.event);
    	
    queue()
    	.defer(d3.json, 'json/lieux_pl_aplat.geojson')
    	.defer(d3.json, 'json/lieux_pl.geojson')
    	.defer(d3.json, 'json/lieux_pl_centroides.geojson')
    	.await(afficheCarte);
	
	// LANCEMENT
	afficheCarte();
	
}

function zoomed() {
  projection
      .translate(zoom.translate())
      .scale(zoom.scale());

	svg.selectAll(".lieux_aplat")
  		.attr("d", path);
  	svg.selectAll(".lieux")
  		.attr("d", path);
  	svg.selectAll('.lieux_centroides')
  		.attr("transform", function(d) { return "translate(" + projection([d.properties.XCOORD, d.properties.YCOORD])[0] + ", " + projection([d.properties.XCOORD, d.properties.YCOORD])[1] +")"; })

}


function afficheCarte(error, lieux_aplat, lieux, lieux_centroides) {
	
	if(error) { console.log(error); }
	
	svg.selectAll('path')
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
	});
	
	svg.selectAll('.lieux')
		.data(lieux.features)
		.enter()
		.append("path")
		.attr("d", path)
		.attr("class", "lieux");

	svg.selectAll('.lieux_centroides')
		//.data(lieux_centroides.features.filter(function (d) {return d.properties.echelle2 == "zone administrative"}))
		.data(lieux_centroides.features)
		.enter()
		.append("path")
		.attr("d", "path")
		.attr("transform", function(d) { return "translate(" + projection([d.properties.XCOORD, d.properties.YCOORD])[0] + ", " + projection([d.properties.XCOORD, d.properties.YCOORD])[1] +")"; })
		.attr("d", d3.svg.symbol()
			.type("circle")
			.size(function (d) {return Math.pow(Math.sqrt(d.properties.nb_prodlai/Math.PI)*20, 2); }))
		.attr("class", "lieux_centroides")
		.on('mousemove', function (d) {
			var current_lieu = d.properties.id_lieu
			d3.selectAll(".lieux").filter(function(d, i) {
				return d.properties.id_lieu == current_lieu;
			})
				.classed("lieux_highlighted", true);
			var mouse = d3.mouse(svg.node()).map(function (d) {
				return parseInt(d);
			});
			tooltip.classed('hidden', false)
				.attr('style', 'left:' + (mouse[0] + 20) + 'px; top:' + (mouse[1] + 20) + 'px')
				.html(d.properties.lieu + " : <br>" + d.properties.nb_prodlai + " produit(s) laitier(s)");
		 })
		.on('mouseout', function () {
			d3.selectAll(".lieux")
				.classed("lieux_highlighted", false)
			tooltip.classed('hidden', true);
		});

}
	
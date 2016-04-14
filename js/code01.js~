// code javascript du jeu clic balles
$(function() {
	init();
});

function init() {
	
	// STRUCTURES
	
	// titre
	var titre = "<p>Superposition des lieux</p>";
	document.getElementById("titre").innerHTML = titre;
	// pied de page
	var footer = "<p>TERESMA - carte test</p>";
	document.getElementById("footer").innerHTML = footer;

	// DONNEES


	
	// VARIABLES
	var width = 500,
    	height = 500;
    svg = d3.select("#carte")
    	.append("svg")
    	.attr("width", width)
    	.attr("height", height);
    projection = d3.geo.conicConformal() // Lambert-93
    	.center([2.454071, 47.279229]) // On centre la carte
    	.scale(6000)
    	.translate([350, 0]);
 
	path = d3.geo.path()
		.projection(projection);
		
	color = d3.scale.linear()
		.domain([1, 10])
		.range(["#f7fcf5", "#00441b"]);

	g = svg.append("g");
	
	
	// LANCEMENT
	afficheCarte();

	
}


function afficheCarte() {


	d3.json("json/lieux_aplat.geojson", function(lieux) {
				svg.selectAll("path")
					.data(lieux.features)
					.enter()
					.append("path")
					.attr("d", path)
					.style("fill", function (d) {;
						var value = d.properties.nb_lieux
						if (value) {
							return color(value)
						} else {
							return "#ccc"
						}
					});
			});

}


	
	


	

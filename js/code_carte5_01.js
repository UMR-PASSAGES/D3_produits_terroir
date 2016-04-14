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
	var titre = "<p>Types de produits AAPRA : boissons</p>";
	document.getElementById("titre").innerHTML = titre;
	// liste
	var listeCateg = '<select id="listeCateg" name="listeCateg"/>';
	document.getElementById("liste").innerHTML = listeCateg;
	// pied de page
	var footer = "<p>TERESMA - carte 5</p>";
	document.getElementById("footer").innerHTML = footer;

	// DONNEES
	
	// liste fichiers : id, nom
	listeJSON = new Array();
	listeJSON[0] = [0, 'json/lieux_centroides_Cadet.geojson'];
	listeJSON[1] = [1, 'json/lieux_centroides_Leclerc.geojson'];
	listeJSON[2] = [2, 'json/lieux_centroides_AAPRA.geojson'];

	
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
    	.scale(6000)
    	.translate([350, 0]);
 
	path = d3.geo.path()
		.projection(projection);
	
	// échelle de couleur pour les lieux
	color = d3.scale.linear()
		.domain([1, 10])
		.range(["#f7fcf5", "#00441b"]);
		
	// liste des champs pour calculer le décalage en X
	listeChamps = new Array();
	listeChamps[0] = ["alc_fort", "#F4F4F4", "Apéritif, liqueur, eau-de-vie"];
	listeChamps[1] = ["vin", "#FF4E4E", "Vin"];
	listeChamps[2] = ["biere", "#FFDA11", "Bière"];
	listeChamps[3] = ["cidre", "#C6F260", "Cidre"];

	g = svg.append("g");

	svg
    	.call(zoom)
    	.call(zoom.event);
    	
    queue()
    	.defer(d3.json, 'json/fond.geojson')
    	.defer(d3.json, 'json/lieux_aplat.geojson')
    	.defer(d3.json, 'json/lieux.geojson')
    	.defer(d3.json, 'json/lieux_centroides_AAPRA.geojson')
    	.await(afficheCarte);
    	
    // listes
	listeCateg = document.getElementById('listeCateg');
	
	// GESTIONNAIRES
	listeCateg.addEventListener('change', afficheCateg);
	
	// LANCEMENT
	remplissageListe();
	afficheCarte();
	
}

function zoomed() {
  projection
    .translate(zoom.translate())
    .scale(zoom.scale());
	
	svg.selectAll(".fond")
  		.attr("d", path);
	svg.selectAll(".lieux_aplat")
  		.attr("d", path);
  	svg.selectAll(".lieux")
  		.attr("d", path);
  	 svg.selectAll('.lieux_centroides')
  		.attr("transform", function(d) { return "translate(" + projection([d.properties.XCOORD, d.properties.YCOORD])[0] + ", " + projection([d.properties.XCOORD, d.properties.YCOORD])[1] +")"; })
  	for (i = 0; i < listeChamps.length; i++) {
  		zoomCentroides(listeChamps[i][0]);
  	}	
}

function remplissageListe() {
	html = '<select id="listeCateg" name="listeCateg">';
	html += '<option value="rien">toutes</option>';
	for (i=0; i<listeChamps.length; i++) {
		html += '<option value="' + listeChamps[i][2] + '">' +  listeChamps[i][2] + '</option>';
	}
	html += '</select>';
	listeCateg.innerHTML = html;
}

function afficheCarte(error, fond, lieux_aplat, lieux, lieux_centroides) {
	
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
	});
	
	svg.selectAll('.lieux')
		.data(lieux.features)
		.enter()
		.append("path")
		.attr("d", path)
		.attr("class", "lieux");

	// affiche les centroïdes pour la première catégorie
	afficheCentroides(lieux_centroides, listeChamps[0][0], listeChamps[0][1], listeChamps[0][2])
	// ajoute les autres catégories
	for (i = 0; i < listeChamps.length; i++) {
		appendCentroides(lieux_centroides, listeChamps[i][0], listeChamps[i][1], listeChamps[i][2])
	}


}

function afficheCateg() {
	
	// récupère la valeur de la liste
	indexListe = listeCateg.selectedIndex-1;
	
	// si une catégorie précise est sélectionnée
	if (indexListe>=0) {
		// récupère le nom du champ correspondant et la couleur
		champ = listeChamps[indexListe][0];
		couleur = listeChamps[indexListe][1];
		
		d3.json('json/lieux_centroides_AAPRA.geojson', function(centroides) {
			// efface les centroïdes existants
			svg.selectAll('.lieux_centroides')
				.remove()
			svg.selectAll('.lieux_centroides')
				.data(centroides.features.filter(function (d) {return d.properties[champ] > 0}))
				.enter()
				.append("path")
				.attr("d", "path")
				.attr("transform", function(d) { return "translate(" + projection([d.properties.XCOORD, d.properties.YCOORD])[0] + ", " + projection([d.properties.XCOORD, d.properties.YCOORD])[1] +")"; })
				.attr("d", d3.svg.symbol()
					.type("circle")
					.size(function (d) {return Math.pow(Math.sqrt(d.properties[champ]/Math.PI)*20, 2); }))
				.attr("fill", couleur)
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
						.html(d.properties.lieu + " : <br>" + d.properties[champ] + " produit(s)");
				 })
				.on('mouseout', function () {
					d3.selectAll(".lieux")
						.classed("lieux_highlighted", false)
					tooltip.classed('hidden', true);
				});
		});
	// si l'option "toutes" est sélectionnée
	} else {
		d3.json('json/lieux_centroides_AAPRA.geojson', function(centroides) {
			// efface les centroïdes existants
			svg.selectAll('.lieux_centroides')
				.remove()
			svg.selectAll('.lieux_centroides')
				// affiche les centroïdes pour la première catégorie
				afficheCentroides(centroides, listeChamps[0][0], listeChamps[0][1], listeChamps[0][2])
				// ajoute les autres catégories
				for (i = 0; i < listeChamps.length; i++) {
					appendCentroides(centroides, listeChamps[i][0], listeChamps[i][1], listeChamps[i][2])
				}
		})
	}
}

function afficheCentroides(centroides, champ, couleur, intitule) {
	svg.selectAll('.lieux_centroides')
		.data(centroides.features.filter(function (d) {return d.properties[champ] > 0}))
		.enter()
		.append("path")
		.attr("d", "path")
		.attr("transform", function(d) {
			var x_centroide = Number(projection([d.properties.XCOORD, d.properties.YCOORD])[0]);
			var y_centroide = Number(projection([d.properties.XCOORD, d.properties.YCOORD])[1]);
			return "translate(" + x_centroide + ", " + y_centroide +")";
		})
		.attr("d", d3.svg.symbol()
			.type("circle")
			.size(50))
		.attr("fill", couleur)
		.attr("class", 'lieux_centroides' + ' ' + champ)
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
				.html(d.properties.lieu + '<br>' + intitule + ' : ' + d.properties[champ] + ' produit(s)');
		 })
		.on('mouseout', function () {
			d3.selectAll(".lieux")
				.classed("lieux_highlighted", false)
			tooltip.classed('hidden', true);
		});
}

function appendCentroides(centroides, champ, couleur, intitule) {
	svg.append("g").selectAll('.lieux_centroides')
		.data(centroides.features.filter(function (d) {return d.properties[champ] > 0}))
		.enter()
		.append("path")
		.attr("d", "path")
		.attr("transform", function(d) {
			offset = 0
			listeChamps0 = new Array()
			for (i = 0; i < listeChamps.length; i++) {
				listeChamps0[i] = listeChamps[i][0]
			}
			for (i = 0; i < listeChamps0.indexOf(champ); i++) {
				if (Boolean(Number(d.properties[listeChamps[i][0]])) == true) {
					offset += 5
				}
			}	
			var x_centroide = Number(projection([d.properties.XCOORD, d.properties.YCOORD])[0]) + offset;
			var y_centroide = Number(projection([d.properties.XCOORD, d.properties.YCOORD])[1]);
			return "translate(" + x_centroide + ", " + y_centroide +")";
		})
		.attr("d", d3.svg.symbol()
			.type("circle")
			.size(50))
		.attr("fill", couleur)
		.attr("class", 'lieux_centroides' + ' ' + champ)
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
				.html(d.properties.lieu + '<br>' + intitule + ' : ' + d.properties[champ] + ' produit(s)');
		 })
		.on('mouseout', function () {
			d3.selectAll(".lieux")
				.classed("lieux_highlighted", false)
			tooltip.classed('hidden', true);
		});
}

function zoomCentroides(champ) {
	svg.selectAll('.' + champ)
  		.attr("transform", function(d) {
  			offset = 0
			listeChamps0 = new Array()
			for (i = 0; i < listeChamps.length; i++) {
				listeChamps0[i] = listeChamps[i][0]
			}
			for (i = 0; i < listeChamps0.indexOf(champ); i++) {
				if (Boolean(Number(d.properties[listeChamps[i][0]])) == true) {
					offset += 5
				}
			}	
			var x_centroide = Number(projection([d.properties.XCOORD, d.properties.YCOORD])[0]) + offset;
			var y_centroide = Number(projection([d.properties.XCOORD, d.properties.YCOORD])[1]);
			return "translate(" + x_centroide + ", " + y_centroide +")";
  		})
}

	
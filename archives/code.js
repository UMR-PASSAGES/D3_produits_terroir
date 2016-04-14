// code javascript du jeu clic balles
$(function() {
	init();
});

function init() {
	
	// STRUCTURES
	
	// titre
	var titre = "<p>Cadet de Gassicourt : salé, sucré ou autre</p>";
	document.getElementById("titre").innerHTML = titre;
	// carte
	//var carte = "<p>future carte</p>";
	//document.getElementById("carte").innerHTML = carte;
	// liste
	var listeCat2 = '<select id="listeCat2" name="listeCat2"/>';
	document.getElementById("liste").innerHTML = listeCat2;
	// pied de page
	var footer = "<p>TERESMA - carte test</p>";
	document.getElementById("footer").innerHTML = footer;

	// DONNEES
	// liste catégories : id, libellé, libellé colonne commune, id couleur
	listeCat = new Array();
	listeCat[0] = [0,'salé','nb_sale',0];
	listeCat[1] = [1,'sucré','nb_sucre',1];
	listeCat[2] = [2,'autre','nb_autre',2];
	
	// liste couleurs : id, html
	listeCouleurs = new Array();
	listeCouleurs[0] = [0, '#66c2a5'];
	listeCouleurs[1] = [1, '#fc8d62'];
	listeCouleurs[2] = [2, '#8da0cb'];

	
	// VARIABLES
	var width = 500,
    	height = 500;
    svg = d3.select("#carte")
    	.append("svg")
    	.attr("width", width)
    	.attr("height", height);
    projection = d3.geo.conicConformal() // Lambert-93
    	.center([2.454071, 47.279229]) // On centre la carte sur la France
    	.scale(10000)
    	.translate([500, -200]);
 
	path = d3.geo.path()
		.projection(projection);

	g = svg.append("g");
	
	// listes
	listeCat2 = document.getElementById('listeCat2');

	
	// GESTIONNAIRES
	listeCat2.addEventListener('change', colorieCarte);
	
	
	// LANCEMENT
	remplissageListe();
	afficheCarte();

	
}

function remplissageListe() {
	html = '<select id="listeCat2" name="listeCat2">';
	html += '<option value="rien">choisissez une valeur...</option>';
	for (i=0; i<listeCat.length; i++) {
		html += '<option value="' + listeCat[i][1] + '">' +  listeCat[i][1] + '</option>';
	}
	html += '</select>';
	listeCat2.innerHTML = html;
}

function afficheCarte() {

	d3.json("json/departements_wgs84.json", function(depts) {
				svg.selectAll("path")
					.data(depts.features)
					.enter()
					.append("path")
					.attr("d", path)
					.attr("class", "depts");
			});
	
	d3.json("json/communes_Gassicourt_wgs84.json", function(communes) {
				g.append("g")
					.selectAll("path")
					.data(communes.features)
					.enter()
					.append("path")
					.attr("class", "communesNeutre")
					.attr("d", path);
			});	
}

function colorieCarte() {
	// récupère la valeur de la liste
	indexListe = listeCat2.selectedIndex-1;
	console.log('indexListe : ' + indexListe);
	// récupère la couleur et le nom de la colonne correspondantes
	if (indexListe>=0) {
		couleur = listeCouleurs[indexListe][1];
		nomCol = listeCat[indexListe][2];
		console.log(nomCol);
	} else {
		couleur = "silver"
	}
	
	
	// colorie les communes
	g.selectAll("path")
		.style("fill", function(d) {
						var value = d.properties[nomCol];
						if (value) {
							return couleur;
						} else {
							return "silver";
							}
		})
		.style("stroke", function(d) {
						var value = d.properties[nomCol];
						if (value) {
							return couleur;
						} else {
							return "silver";
							}
		})
		.style("stroke-width", 3);
}
	

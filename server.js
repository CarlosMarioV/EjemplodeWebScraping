var express = require('express');
var fs = require('fs');
var request = require('request');
var cheerio = require('cheerio');
var app = express();
var mongodb = require('./insertMongoDB.js');

(function () {
	urlCRAutos = 'http://crautos.com/rautosusados/'; // Página CRautos -Usados.
	request(urlCRAutos, function (error, response, html) {
		if (!error) {
			var $ = cheerio.load(html);
			var informacion = [];
			$('a.inventory.mainhlcar').each(function (i, element) {
				var tbody = $(element).children().children().children().children();
				var marca = obtenerMarca(tbody.first().text());
				var modelo = obtenerModelo(tbody.eq(1).find('.modeltitle').text());
				var anno = obtenerModelo(tbody.eq(1).find('.modeltitle').children().text());
				var trasmicion = obtenerTipoTrasmicion(tbody.eq(1).find('.transtitle').text());
				var urlImagen = tbody.eq(2).children().children().attr('src');
				var detalle = tbody.eq(3).children().children().children().children().text();
				var precio = obtenerPrecio(tbody.eq(4).children().text());
				var precioDolares = obtenerTipoTrasmicion(tbody.eq(5).children().text());;
				var metadata = {
					marca: marca,
					modelo: modelo,
					anno: anno,
					trasmicion: trasmicion,
					urlImagen: urlImagen,
					comentario: detalle,
					precio: precio,
					precioDolares: precioDolares
				}
				informacion.push(metadata);
				var dataToInsert = {
					collection: 'dataWeb_CRAutos',
					query: metadata
				}
				mongodb.addDocument(dataToInsert, function (res) {
					if (!res.success) {
						console.log('Ocurrio un error con uno de los datos.');
					}
				});
			});
			console.log('Se obtuvieron los datos de CRAutos');
		} else {
			console.log('No se pudo cargar la página.');
		}
	});
	var urlHacker = 'https://news.ycombinator.com';
	request(urlHacker, function (error, response, html) {
		if (!error && response.statusCode == 200) {
			var $ = cheerio.load(html);
			var resultadoDelParser = [];
			var success = [];
			var error = [];
			$('span.comhead').each(function (i, element) {
				// Seleccione el elemento anterior
				var a = $(this).prev();
				// Obtener el rango al analizar el elemento dos niveles sobre el elemento "a"
				var rank = a.parent().parent().text();
				// Parse el título del enlace
				var title = a.text();
				// Analizar el atributo href del elemento "a"
				var url = a.attr('href');
				// Obtenga el subtexto hijos de la siguiente fila en la tabla HTML.
				var subtext = a.parent().parent().next().children('.subtext').children();
				// Extrae los datos relevantes de los niños
				var points = $(subtext).eq(0).text();
				var userName = $(subtext).eq(1).text();
				var comments = $(subtext).eq(2).text();
				// Nuestro objeto de metadatos analizado
				var metadata = {
					rango: parseInt(rank),
					titulo: title,
					url: url,
					puntos: parseInt(points),
					nombreUsuario: userName,
					comentarios: parseInt(comments)
				};
				var dataToInsert = {
					collection: 'dataWeb',
					query: metadata
				}
				mongodb.addDocument(dataToInsert, function (res) {
					if (!res.success) {
						console.log('Ocurrio un error con uno de los datos');
					}
				});
			});
			console.log('Se obtuvieron los datos de hacker');
		};
	});

})();

function obtenerTipoTrasmicion(trasmicion) {
	var palabra = '',
		estado = false;
	for (var i = 0; i < trasmicion.length; i++) {
		if (trasmicion[i] === ')') {
			estado = false;
			return palabra;
		}
		if (estado) {
			palabra += trasmicion[i];
		}
		if (trasmicion[i] === '(') {
			estado = true;
		}
	}
};

function obtenerModelo(modelo) {
	var palabra = '',
		estado = true;
	for (var i = 0; i < modelo.length; i++) {
		if (modelo[i] === ' ') {
			estado = false;
			return palabra;
		}
		if (estado) {
			palabra += modelo[i];
		}
	}
}

function obtenerMarca(marca) {
	var palabra = '',
		estado = true;
	for (var i = 0; i < marca.length; i++) {
		if (marca[i] === '\n' && i !== 0) {
			estado = false;
			return palabra;
		}
		if (estado && i > 1 && marca[i] !== ' ') {
			palabra += marca[i];
		}
	}
}

function obtenerPrecio(precio) {
	var palabra = '',
		estado = true;
	for (var i = 0; i < precio.length; i++) {
		if (precio[i] === ' ' && i > 2) {
			estado = false;
			return palabra;
		}
		if (estado && i > 1 && precio[i] !== ' ') {
			palabra += precio[i];
		}
	}
}

app.listen('8081');

console.log('El puerto del Web Scraping: 8081');

exports = module.exports = app;
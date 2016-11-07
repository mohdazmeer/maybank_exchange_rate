// This is a template for a Node.js scraper on morph.io (https://morph.io)

var cheerio = require("cheerio");
var request = require("request");
var sqlite3 = require("sqlite3").verbose();

function initDatabase(callback) {
	// Set up sqlite database.
	var db = new sqlite3.Database("data2.sqlite");
	db.serialize(function() {
		db.run("CREATE TABLE IF NOT EXISTS data2 (currency TEXT, rate TEXT)");
		callback(db);
	});
}

function updateRow(db, currency, rate) {
	// Insert some data.
	var statement = db.prepare("INSERT INTO data2 VALUES (?, ?)");
	statement.run([currency, rate]);
	statement.finalize();
}

function readRows(db) {
	// Read some data.
	db.each("SELECT rowid AS id, currency, rate FROM data2", function(err, row) {
		console.log(row.id + ": " + row.currency + " : " + row.rate);
	});
}

function fetchPage(url, callback) {
	// Use request to read in pages.
	request(url, function (error, response, body) {
		if (error) {
			console.log("Error requesting page: " + error);
			return;
		}

		callback(body);
	});
}

function run(db) {
	// Use request to read in pages.
	fetchPage("http://www.rhb.com.my/malaysia/products-and-services/rates-and-charges/treasury-rates/foreign-exchange", function (body) {
		// Use cheerio to find things in the page with css selectors.
		var $ = cheerio.load(body);
		var elements = $(".text-center+ .text-right , td:nth-child(2)").each(function () {
			var value = $(this).text().trim();
			updateRow(db, value, 'xxx');
		});

		readRows(db);

		db.close();
	});
}

initDatabase(run);

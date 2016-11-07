// This is a template for a Node.js scraper on morph.io (https://morph.io)

var cheerio = require("cheerio");
var request = require("request");
var sqlite3 = require("sqlite3").verbose();

function initDatabase(callback) {
	// Set up sqlite database.
	var db = new sqlite3.Database("data.sqlite");
	db.serialize(function() {
		db.run("CREATE TABLE IF NOT EXISTS data (name TEXT)");
		callback(db);
	});
}

function updateRow(db, value) {
	// Insert some data.
	var statement = db.prepare("INSERT INTO data VALUES (?)");
	statement.run(value);
	statement.finalize();
}

function readRows(db) {
	// Read some data.
	db.each("SELECT rowid AS id, name FROM data", function(err, row) {
		console.log(row.id + ": " + row.name);
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
	fetchPage("http://www.maybank2u.com.my/mbb_info/m2u/public/treasuryRates.do?channelId=BTRE-Treasury&cntTypeId=0&cntKey=BTRE04.01&programId=BTRE04-Rates&chCatId=/mbb/Business/BTRE-Treasury", function (body) {
		// Use cheerio to find things in the page with css selectors.
		var $ = cheerio.load(body);

		var elements = $("table.even tbody tr.alt_even td").each(function () {
			var value = $(this).text().trim();
			updateRow(db, value);
		});

		readRows(db);

		db.close();
	});
}

initDatabase(run);

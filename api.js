////////////////////////////////////////////////////////////////////////////////////////////////////
// PROCESS
var pro = process;
pro.inc = {};
pro.inc.moment = require('moment');
pro.inc.express = require('express');
pro.inc.express_parser = require('body-parser');
// modules
pro.request = require('request');
pro.fs = require('fs');
pro.q = require('q');
// env
pro.env.PORT = 8000;
pro.env.PATH = __dirname;
// app
pro.app = pro.inc.express();
pro.app.use(pro.inc.express_parser.json());
pro.app.use(pro.inc.express_parser.urlencoded({ extended: true }));
//pro.app.use(pro.inc.express_parser.multipart());
// custom
pro.contentful = require("./node_custom/contentful.js");
pro.backand = require("./node_custom/backand.js");
pro.fun = require("./node_custom/fun.js");
pro.view = require("./node_custom/view.js");
pro.console = require("./node_custom/console.js").console;
// secret
pro.secret = require('../../secret/all.js');


////////////////////////////////////////////////////////////////////////////////////////////////////
// SERVE SITES
process.app.get('/sites', function(request, response) {
	process.console.warn('all sites');
	var data = 
	[
	{
	 "id": "0",
	 "protocol": "http://",
	 "domain": "filmlinc.com",
	 "path": "/pages/festivals",
	 "item_selector": ".snippet-blog",
	 "link": "http://filmlinc.com/pages/festivals",
	 "items": "[\n {\n  \"img\": {},\n  \"body\": \"<p>Scary Movies (October 31 - November 6, 2014)</p>\\n<p>Every Halloween, Scary Movies brings a deadly dosage of hair-raising premieres and classics.</p>\\n\"\n },\n {\n  \"img\": {},\n  \"body\": \"<p>Making Waves: New Romanian Cinema&nbsp;(December 4 – 8, 2014)</p>\\n<p>Making Waves, co-presented with the Romanian Film Initiative, brings some of the best new Romanian cinema to New York along with overlooked classics, panel discussions, and more.</p>\\n\"\n },\n {\n  \"img\": {},\n  \"body\": \"<p>New York Jewish Film Festival (January 14 – 29, 2015)</p>\\n<p>The New York Jewish Film Festival, co-presented with the Jewish Museum, is a preeminent showcase for world cinema exploring the Jewish experience.</p>\\n\"\n },\n {\n  \"img\": {},\n  \"body\": \"<p>Dance on Camera&nbsp;(January 30 – &nbsp;February 3, 2015)</p>\\n<p>Dance on Camera, co-presented with Dance Films Association, presents an exciting and diverse array of dance films, many of them premieres, ranging widely in subject and genre.</p>\\n\"\n },\n {\n  \"img\": {},\n  \"body\": \"<p>Film Comment Selects&nbsp;(February 20 – March 1, 2015)</p>\\n<p>Film Comment magazine’s crucial and eclectic festival brings you a handpicked lineup of the coming-soon and the never-coming-back, the rare and the rediscovered, the unclassifiable and the underrated, the sacred and the profane, the cute and the creepy, the tough and the tender, the naked and the dead—you get the idea.</p>\\n\"\n },\n {\n  \"img\": {},\n  \"body\": \"<p>Rendez-vous with French Cinema&nbsp;(March 6&nbsp;– 15, 2015)</p>\\n<p>North America’s leading showcase for the best in French film, co-presented with Unifrance Films, attests to the sheer variety and vitality of contemporary French filmmaking.</p>\\n\"\n },\n {\n  \"img\": {},\n  \"body\": \"<p>New Directors/New Films Festival&nbsp;(March 18 – 29, 2015)</p>\\n<p>New Directors/New Films&nbsp;introduces New York audiences to the work of emerging filmmakers from around the world. Co-presented with the Museum of Modern Art, this renowned festival has uncovered talents like Pedro Almódovar, Darren Aronofsky, Nicole Holofcener, Spike Lee, Kelly Reichardt, and Steven Spielberg.</p>\\n\"\n },\n {\n  \"img\": {},\n  \"body\": \"<p>This new annual nonfiction showcase is founded on the most expansive possible view of documentary film. The inaugural edition featured new work from around the world alongside retrospective selections by both known and unjustly forgotten filmmakers. It is a platform for filmmakers and artists who have given us a wider view of nonfiction cinema and at the same time brought the form full circle, back to its early, boundary-pushing days.</p>\\n\"\n },\n {\n  \"img\": {},\n  \"body\": \"<p>Chaplin Award Gala (April 27, 2015)</p>\\n<p>Academy Award–winning director, actor, producer, and environmentalist Robert Redford will be honored at the 42nd Annual Chaplin Award Gala. The evening will celebrate the plethora of iconic roles he has played and the remarkable work he has directed and/or produced. Redford continues to influence the world of cinema, through his distinguished stage and film career, as well as his continued support of several generations of innovative voices in independent film through his nonprofit Sundance Institute and internationally recognized Film Festival.</p>\\n\"\n },\n {\n  \"img\": {},\n  \"body\": \"<p>Columbia University Film Festival&nbsp;(May 1 – 3, 2015)</p>\\n<p>Columbia University School of the Arts Film Program presents the annual Columbia University Film Festival, a week-long program of screenings, dramatic readings and special events in New York.</p>\\n\"\n },\n {\n  \"img\": {},\n  \"body\": \"<p>New York African Film Festival&nbsp;(May 6 – 12, 2015)</p>\\n<p>The New York African Film Festival is a showcase of works that speak to the realities of Africa and the Diaspora. Through the exhibition of works by filmmakers and other visual and performing artists, as well as presentations by critics, scholars and master chefs, festivalgoers will witness the reinvention of Africa through the movement of its people across the globe.</p>\\n\"\n },\n {\n  \"img\": {},\n  \"body\": \"<p>Open Roads: New Italian Cinema&nbsp;(Dates TBD)</p>\\n<p>One of our most popular annual programs, Open Roads has served as the leading North American showcase of contemporary Italian cinema for the past 13 years.</p>\\n\"\n },\n {\n  \"img\": {},\n  \"body\": \"<p>Human Rights Watch Film Festival&nbsp;(June 12 – 20, 2015)</p>\\n<p>The Human Rights Watch Film Festival brings human rights abuses to life through storytelling in a way that challenges each individual to empathize and demand justice for all.</p>\\n\"\n },\n {\n  \"img\": {},\n  \"body\": \"<p>New York Asian Film Festival&nbsp;(Dates TBD)</p>\\n<p>A two-week orgy of popular Asian cinema, this is the film festival that The New York Times calls \\\"one of the city’s most valuable events.\\\"</p>\\n\"\n },\n {\n  \"img\": {},\n  \"body\": \"<p>Featuring films from an array of genres and styles, Latinbeat follows the latest trends of filmmaking in Latin America by showcasing both up-and-coming directors and filmmakers whose work we have proudly premiered in the past.</p>\\n\"\n },\n {\n  \"img\": {},\n  \"body\": \"<p>NewFest is dedicated to bringing together filmmakers and audiences in the building of a community that passionately supports giving greater visibility&nbsp;and voice to a wide range of expressions and representations of the LGBT experience.</p>\\n\"\n },\n {\n  \"img\": {},\n  \"body\": \"<p>Our music documentary series explores an exciting range of artists, genres and styles.</p>\\n\"\n },\n {\n  \"img\": {},\n  \"body\": \"<p>With the 52nd annual New York Film Festival on the horizon, the Film Society invites you to whet your appetite with a sampling of past triumphs by its main-slate directors. From Fincher to Assayas to the late Alain Resnais, NYFF Opening Acts takes you deep into the back catalogs of today’s foremost talents.</p>\\n\"\n },\n {\n  \"img\": {},\n  \"body\": \"<p>New York Film Festival&nbsp;(September 25&nbsp;–&nbsp;October 11, 2015)</p>\\n<p>Since 1963, the New York Film Festival has brought new and important cinematic works from around the world to Lincoln Center. In addition to the Main Slate official selections, the festival includes newly restored classics, special events, filmmaker talks, panel discussions, an Avant-Garde showcase, and much more.&nbsp;The New York Film Festival highlights the best in world cinema, featuring top films from celebrated filmmakers as well as fresh new talent.</p>\\n\"\n }\n]"
	}
	]
	;
	if (data) {
		response.setHeader('Content-Type', 'application/json');
		response.writeHead(200);
		response.write(pro.fun.stringify_once(data));
		response.end();
	}
});


////////////////////////////////////////////////////////////////////////////////////////////////////
// SERVE SITE
process.app.get('*', function(request, response) {
	process.console.warn('one site');
	var data = 
	[
	{}
	]
	;
	if (data) {
		response.setHeader('Content-Type', 'application/json');
		response.writeHead(200);
		response.write(pro.fun.stringify_once(data));
		response.end();
	}
});


////////////////////////////////////////////////////////////////////////////////////////////////////
// SAVE SITE
process.app.post('*', function(request, response) {
	// data
	process.console.warn('save site');
	for (var ea in request.body) {
		if (ea=='json') {
			request.body[ea] = JSON.parse(request.body[ea]);
		}
	}
	process.console.info(request.body);
	// view
	response.setHeader('Content-Type', 'application/json');
	response.writeHead(200);
	response.write(pro.fun.stringify_once({data:{}}));
	response.end();
	// quit
	process.exit();
});


////////////////////////////////////////////////////////////////////////////////////////////////////
process.app.listen(8000, function() {
  console.log("Node app is running at localhost: 8000");
});
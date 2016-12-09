/**
 * This is an Alexa Skill for Simpson's Quote Finder.
 */

/**
 * App ID for the skill
 */
var APP_ID = '';

/**
 * The AlexaSkill prototype and helper functions
 */
var AlexaSkill = require('./AlexaSkill');

/**
 * SimpsonsQuotes is a child of AlexaSkill.
 */
var SimpsonsQuotes = function () {
    AlexaSkill.call(this, APP_ID);
};

// Extend AlexaSkill
SimpsonsQuotes.prototype = Object.create(AlexaSkill.prototype);
SimpsonsQuotes.prototype.constructor = SimpsonsQuotes;

SimpsonsQuotes.prototype.eventHandlers.onSessionStarted = function (sessionStartedRequest, session) {
    console.log("SimpsonsQuotes onSessionStarted requestId: " + sessionStartedRequest.requestId
        + ", sessionId: " + session.sessionId);
    // any initialization logic goes here
};

SimpsonsQuotes.prototype.eventHandlers.onLaunch = function (launchRequest, session, response) {
    console.log("SimpsonsQuotes onLaunch requestId: " + launchRequest.requestId + ", sessionId: " + session.sessionId);
    var speechOutput = "The Simpson's Quote Finder will take a quote or reference from the Simpson's and attempt to find the season and episode it belongs to. You can ask things like: find purple monkey dishwasher. For more detailed instructions simply ask help. What can I help you find?",
        repromptText = "You can speak any Simpson's quote and I'll try to match it to an episode and season. What can I help you find?";
    response.ask(speechOutput, repromptText);
};

SimpsonsQuotes.prototype.eventHandlers.onSessionEnded = function (sessionEndedRequest, session) {
    console.log("SimpsonsQuotes onSessionEnded requestId: " + sessionEndedRequest.requestId
        + ", sessionId: " + session.sessionId);
    // any cleanup logic goes here
};

SimpsonsQuotes.prototype.intentHandlers = {
    // register custom intent handlers
    QuoteIntent: function (intent, session, response) {
      var paraphraseSlot = intent.slots.Words,
          paraphraseName;

      if (paraphraseSlot && paraphraseSlot.value){
        var paraphraseName = paraphraseSlot.value.toLowerCase(),
			  paraphrase = paraphraseName;
      }

      // Loading http to consume API and setting our options.
      var http = require('http');
      var options = {
        host: 'www.simpsonquotes.com',
        path: '/search/' + encodeURI(paraphrase),
      };

      // Retrieving and parsing the API upon a valid request from Alexa.
      var req = http.get(options, function(res) {
        res.setEncoding('utf8');

        // Initializing our body var, adding API responses to it, parsing those responses.
        var body = '';
        res.on('data', function(d) {
          body += d;
        });

        res.on('end', function() {
          var quotes = JSON.parse(body),
              resp = "",
              card = "",
              i = 0;

          // If we find a good result we'll spit it out with the episode season and number.
          // Otherwise we ask the user to try again.
          // @todo make this work with multipule results.
          if(quotes[i].score >= 1.5) {
            resp += "The closest match I could find is from season " + quotes[0].season + " episode " + quotes[0].episode + ". The full quote I found is " + quotes[0].text;
            var title = "Simpson's Quote Finder"
            response.tellWithCard(resp, title, resp);
          } else {
            resp += "I couldn't find a good match for that.  Please try again."

            response.ask(resp,resp);
          }
        });
      });
    },
    HelpIntent: function (intent, session, response) {
        response.ask("Please ask me to find your quote by starting your quote with the word find.  For example you can ask to find the purple monkey dishwasher episode by asking: find purple monkey dishwasher. I hope that helps. What can I help you find?");
    },
    CloseIntent: function (intent, session, response) {
        response.tell("A-hoy, hoy","A-hoy, hoy");
    }
};

// Create the handler that responds to the Alexa Request.
exports.handler = function (event, context) {
    // Create an instance of the SimpsonsQuotes skill.
    var simpsonsQuotes = new SimpsonsQuotes();
    simpsonsQuotes.execute(event, context);
};

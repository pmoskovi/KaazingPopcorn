var demoGuy = "David";
//var demoGuy = "Peter";
//var demoGuy = "David";


// Variables you can change
//
var MY_WEBSOCKET_URL = "ws://tutorial.kaazing.com/jms";
var TOPIC_NAME = "/topic/rc";
var IN_DEBUG_MODE = true;
var DEBUG_TO_SCREEN = false;

var MESSAGE_PROPERTIES = {
    "key": "key"
};

var key = "no-one";

// WebSocket and JMS variables
//
var connection;
var session;
var wsUrl;

// JSFiddle-specific variables
//
var runningOnJSFiddle = (window.location.hostname === "fiddle.jshell.net");
var WEBSOCKET_URL = (runningOnJSFiddle ? MY_WEBSOCKET_URL : "ws://" + window.location.hostname + ":" + window.location.port + "/jms");

var peterTruckMsgs = [
[49,"frontlight;on"],
[53,"frontlight;off"],
[55,"frontlight;on"],
[57,"frontlight;off"],
[61,"steering;left : thrust;off"],
[63,"steering;right : thrust;off"],
[65,"steering;left: thrust;off"],
[66,"steering;right : thrust;off"],
[70,"steering;off : thrust;forward"],
[72,"steering;off : thrust;forward"],
[80,"steering;left : thrust;forward"],
[83,"steering;right : thrust;backward"],
[86,"steering;left : thrust;forward"]
];

var davidTruckMsgs = [
[33,"frontlight;on"],
[35,"frontlight;off"],
[36,"frontlight;on"],
[38,"frontlight;off"],
[42,"steering;right : thrust;off"],
[43,"steering;left : thrust;off"],
[44,"steering;right: thrust;off"],
[45,"steering;left : thrust;off"],
[48,"steering;off : thrust;forward"],
[50,"steering;off : thrust;backward"],
[51,"steering;off : thrust;forward"],
[52,"steering;off : thrust;backward"],
[86,"steering;left : thrust;forward"]
];

var errorCallback = function(e) {
console.log('Reeeejected!', e);
};

// Not showing vendor prefixes.
navigator.getUserMedia  = navigator.getUserMedia ||
              navigator.webkitGetUserMedia ||
              navigator.mozGetUserMedia ||
              navigator.msGetUserMedia;

var video = document.getElementById ("selfVideo");

if (navigator.getUserMedia) {
  navigator.getUserMedia({audio: false, video: true}, function(stream) {
    video.src = window.URL.createObjectURL(stream);
  }, errorCallback);
} else {
  video.src = 'somevideo.webm'; // fallback.
}

var truckMsgs;
(demoGuy === "Peter") ? truckMsgs = peterTruckMsgs : truckMsgs = davidTruckMsgs;

// Variable for log messages
//
var screenMsg = "";

// Used for development and debugging. All logging can be turned
// off by modifying this function.
//
var consoleLog = function(text) {
    if (IN_DEBUG_MODE) {
        if (runningOnJSFiddle || DEBUG_TO_SCREEN) {
            // Logging to the screen
            screenMsg = screenMsg + text + "<br>";
            $("#logMsgs").html(screenMsg);
        } else {
            // Logging to the browser console
            console.log(text);
        }
    }
};

var handleException = function (e) {
    consoleLog("EXCEPTION: " + e);
};

var handleTopicMessage = function(message) {
};

// Send a message to the topic.
//
var doSend = function(message) {
	message.setStringProperty(MESSAGE_PROPERTIES.key, key);
    topicProducer.send(message, function() {
    	consoleLog("Message sent: " + message.getText());
    });
};

function makeCallback(obj) {
    return function() {
    	doSend(session.createTextMessage(obj[1]));
    };
}

// Connecting...
//
var doConnect = function() {
    // Connect to JMS, create a session and start it.
    //
    var pop = Popcorn( "#truckVideo" );

    var stompConnectionFactory = new StompConnectionFactory(WEBSOCKET_URL);
    try {
        var connectionFuture = stompConnectionFactory.createConnection(function() {
            if (!connectionFuture.exception) {
                try {
                    connection = connectionFuture.getValue();
                    connection.setExceptionListener(handleException);

                    consoleLog("Connected to " + WEBSOCKET_URL);
                    session = connection.createSession(false, Session.AUTO_ACKNOWLEDGE);
                    
                    // Creating topic
                    var myTopic = session.createTopic(TOPIC_NAME);
                    consoleLog("Topic created...");
                    
                    // Creating topic Producer
                    topicProducer = session.createProducer(myTopic);
                    consoleLog("Topic producer created...");

                    // Creating topic Consumer
                    topicConsumer = session.createConsumer(myTopic);
                    consoleLog("Topic consumer created...");

                    topicConsumer.setMessageListener(handleTopicMessage);
                    // *** Task 6b ***                        
   
                    connection.start(function() {
                        // Put any callback logic here.
                        //
                        consoleLog("JMS session created");
                        
                        vid = document.getElementById ("truckVideo");
                        vid.addEventListener ('click', function() {
                                vid.paused ? vid.play() : vid.pause();    
                        });

                        // $('.video').click(function(){this.paused?this.play():this.pause();});
                        for (var truckMsg in truckMsgs) {
						    var obj = truckMsgs[truckMsg];
						    pop.cue( obj[0], makeCallback( obj ) );
						}
                        pop.play();
                    });
                } catch (e) {
                    handleException(e);
                }
            } else {
                handleException(connectionFuture.exception);
            }
        });
    } catch (e) {
        handleException(e);
    }
};

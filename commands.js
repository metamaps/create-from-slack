module.exports = function (rtm, tokens, persistToken, botId, METAMAPS_URL, signInUrl) {
  var Metamaps = require('./metamaps.js')(METAMAPS_URL);
  var metacodes = Metamaps.metacodes;
  var mapsForChannel = {};
  var metacodesForChannel = {};

function getTopicsFromText(text) {
  var topics = [];
  if (!text) return topics;
  metacodes.forEach(function (m) {
    var split = text.split(':');
    if (split[1] && split[1] == m[0]) {
      topics.push({
        metacode_id: m[1],
        name: split[2].trim()
      });
    }
  });
  return topics;
}

function messageContainsMetacodes(text) {
  var topics = getTopicsFromText(text);
  return topics.length > 0;
}

function postTopicsToMetamaps(topics, userId, channel) {
  var addToMap = mapsForChannel[channel];
  topics.forEach(function (topic) {
    Metamaps.addTopicToMap(addToMap, topic, tokens[userId], function (err, topicId, mappingId) {
      if (err == 'topic failed') {
        rtm.sendMessage('failed to create your topic', channel);
      } else if (err == 'mapping failed') {
        rtm.sendMessage('successfully created topic (id: ' + topicId + '), but failed to add it to map ' + addToMap, channel);
      } else {
        rtm.sendMessage('successfully created topic and added it to map ' + addToMap, channel);
      }
    });
  });
}

  var COMMANDS = [
    {
      cmd: "signed in?",
      variable: "",
      helpText: "check whether you're account is connected to your metamaps account",
      requireUser: false,
      check: function (message) {
        return true;
      },
      run: function (message) {
        if (tokens[message.user]) {
          rtm.sendMessage('Yes, you\'re signed in to metamaps.', message.channel);
        } else {
          var id = rtm.activeTeamId + message.user;
          rtm.sendMessage('Nope. You\'re not signed in to metamaps. Click here to sign in: ' + signInUrl + '?id=' + id, message.channel); 
        }
      }
    },
    {
      cmd: "set map ",
      variable: "[MAP_ID]",
      helpText: "set the map on which new topics created in that channel will appear",
      requireUser: false,
      check: function (message) {
        return true;
      },
      run: function (message) {
        mapsForChannel[message.channel] = message.text.substring(8);
        rtm.sendMessage('Ok, I\'ve switched to map ' + mapsForChannel[message.channel] + ' for this channel', message.channel);
      }
    },
    {
      cmd: "show map ",
      variable: "[MAP_ID]",
      helpText: "return all the topics for a given map id in a list",
      requireUser: true,
      check: function (message) {
        return true;
      },
      run: function (message) {
        Metamaps.getMap(message.text.substring(9), tokens[message.user], function (err, topics) {
          if (err) {
            return rtm.sendMessage('there was an error retrieving the map', message.channel);
          }
          rtm.sendMessage(Metamaps.formatTopicsForDisplay(topics), message.channel);
        });
      }
    },
    {
      cmd: "create map ",
      variable: "[NAME_OF_MAP]",
      helpText: "create a map on metamaps by specifying its name",
      requireUser: true,
      check: function (message) {
        return true;
      },
      run: function (message) {
        Metamaps.createMap(message.text.substring(11), tokens[message.user], function (err, mapId) {
          if (err) {
            return rtm.sendMessage('there was an error creating the map', message.channel);
          }
          mapsForChannel[message.channel] = mapId;
          rtm.sendMessage('new map was created with id ' + mapId + ' and set for mapping', message.channel);
        });
      }
    },
    {
      cmd: "set metacode ",
      variable: "[EMOJI_NAME]",
      helpText: "set the default metacode to use for the channel",
      requireUser: false,
      check: function (message) {
        return true;
      },
      run: function (message) {
        var metacode_name = message.text.substring(13);
        var m = Metamaps.findMetacodeByNameOrId(metacode_name);
        if (!m) {
          rtm.sendMessage(metacode_name + ' isn\'t an enabled slack emoji + metacode. please use the name of the slack emoji, without the colons', message.channel);
          return;
        }
        metacodesForChannel[message.channel] = m[1]; // the ID
        rtm.sendMessage('Ok, I\'ve switched the default metacode for this channel to *' + metacode_name + '*', message.channel);
      }
    },
    {
      cmd: "mm: ",
      variable: "[TOPIC_NAME]",
      helpText: "use default metacode for the channel to create a topic",
      requireUser: true,
      check: function (message) {
        return true;
      },
      run: function (message) {
        if (!metacodesForChannel[message.channel]) {
          rtm.sendMessage('default metacode is not set. set it by using `set metacode [emoji_metacode_name]`')
          return;
        }
        var topic_name = message.text.substring(4);
        postTopicsToMetamaps([ 
          { metacode_id: metacodesForChannel[message.channel], name: topic_name.trim() } 
        ], message.user, message.channel);
      }
    },
    {
      cmd: "<@" + botId + '>: help',
      variable: "",
      helpText: "list all the commands that metamapper knows",
      requireUser: false,
      check: function (message) {
        return true;
      },
      run: function (message) {
        var help = 'Hi de ho heyo!\n';
        COMMANDS.forEach(function (command) {
          help += '*' + command.cmd + command.variable + '* ' + command.helpText + '\n';
        });
        rtm.sendMessage(help, message.channel);
      }
    },
    {
      cmd: "",
      variable: "",
      helpText: "create a topic by specifying a metacode, like :person: Cool Dude",
      requireUser: true,
      check: function (message) {
        return messageContainsMetacodes(message.text);
      },
      run: function (message) {
        postTopicsToMetamaps(getTopicsFromText(message.text), message.user, message.channel);    
      }
    }
  ];

  return COMMANDS;
};

var request = require('request');
var rootUrl,
    topicCreateUrl,
    mappingCreateUrl,
    mapCreateUrl,
    mapUrl;

function randomCoord() {
  var min = -600, max = 600;
  return Math.floor(Math.random() * (max - min)) + min;
}

var toExport = {
  metacodes: [
    // first column is slack emoji name, second column is metacode id
    ["Location", 21578242],
    ["Experience", 51848956],
    ["Question", 92282751],
    ["Action", 100698720],
    ["Reference", 112740059],
    ["Process", 113629430],
    ["Problem", 125146708],
    ["Open Issue", 241469500],
    ["Catalyst", 281110143],
    ["Group", 298486374],
    ["Feedback", 339908452],
    ["Future Dev", 374648174],
    ["Role", 378666952],
    ["Need", 434890094],
    ["Intention", 457008489],
    ["Insight", 507103779],
    ["Platform", 510532105],
    ["Task", 513543911],
    ["Trajectory", 546325864],
    ["Knowledge", 587967610],
    ["Idea", 638205575],
    ["Resource", 843966974],
    ["Tool", 854565971],
    ["Activity", 912136629],
    ["Person", 980190962],
    ["Implication", 991788158],
    ["Closed", 1018350795],
    ["Opportunity", 1047793131],
    ["Argument", 1047793132],
    ["Con", 1047793133],
    ["Decision", 1047793134],
    ["Example", 1047793135],
    ["Aim", 1047793136],
    ["Good Practice", 1047793137],
    ["List", 1047793138],
    ["Story", 1047793139],
    ["Note", 1047793140],
    ["Pro", 1047793141],
    ["Research", 1047793142],
    ["Wildcard", 1047793143],
    ["Subject", 1047793144],
    ["Event", 1047793145],
    ["Media", 1047793146],
    ["Metamap", 1047793147],
    ["Model", 1047793148],
    ["Perspective", 1047793149],
    ["Project", 1047793150],
    ["Status", 1047793151]
  ],
  findMetacodeByNameOrId: function (nameOrId) {
    var m;
    toExport.metacodes.forEach(function (metacode) {
      if (metacode[0] === nameOrId || metacode[1] === nameOrId) m = metacode;
    });
    return m;
  },
  findMetacodeName: function (id) {
    return toExport.findMetacodeByNameOrId(id)[0];
  },
  findMetacodeId: function (name) {
    return toExport.findMetacodeByNameOrId(name)[1];
  },
  addTopicToMap: function (map, topic, token, callback) {
    topic.permission = 'commons';
    request.post({
      url: topicCreateUrl,
      form: {
        access_token: token,
        topic: topic
      }
    }, function (err, response, body) {
      if (err || response.statusCode > 200) {
        console.log(err || 'statusCode: ' + response.statusCode);
        console.log('body: ', body);
        return callback('topic failed');
      }
      var body = JSON.parse(body);
      var topicId = body.topics[0].id;
      var mapping = {
        mappable_id: topicId,
        mappable_type: 'Topic',
        map_id: map,
        xloc: randomCoord(),
        yloc: randomCoord()
      };
      request.post({
        url: mappingCreateUrl,
        form: {
          access_token: token,
          mapping: mapping
        }
      }, function (err, response, body) {
        if (err || response.statusCode > 200) {
          console.log(err || 'statusCode: ' + response.statusCode);
          console.log('body: ', body);
          return callback('mapping failed', topicId);
        }
        var body = JSON.parse(body);
        callback(null, topicId, body.mappings[0].id);
      });
    });
  },
  getMap: function (id, token, callback) {
    request.get({
      url: mapUrl + id + '?access_token=' + token
    }, function (err, response, body) {
      if (err || response.statusCode > 200) {
        console.log(err || 'statusCode: ' + response.statusCode);
        console.log('body: ', body);
        return callback(err);
      }
      var body = JSON.parse(body);
      callback(null, body.topics);
    });
  },
  createMap: function (name, token, callback) {
    var map = {
      name: name,
      permission: 'commons',
      arranged: true
    };
    request.post({
      url: mapCreateUrl,
      form: {
        access_token: token,
        map: map
      }
    }, function (err, response, body) {
      if (err || response.statusCode > 200) {
        console.log(err || 'statusCode: ' + response.statusCode);
        console.log('body: ', body);
        return callback('creating map failed');
      }
      var body = JSON.parse(body);
      callback(null, body.maps[0].id);
    });
  },
  formatTopicsForDisplay: function (topics) {
    var string = '';

    topics.forEach(function (t) {
      string += t.name + ' (' + toExport.findMetacodeName(t.metacode_id) + ') \n';
    });

    return string;
  }
}

module.exports = function (METAMAPS_URL) {
  rootUrl = METAMAPS_URL + '/api/v1';
  topicCreateUrl = rootUrl + '/topics';
  mappingCreateUrl = rootUrl + '/mappings';
  mapCreateUrl = rootUrl + '/maps';
  mapUrl = rootUrl + '/maps/';
  return toExport;
}

var request = require('request');
var rootUrl = 'https://metamaps.herokuapp.com/api/v1';
var topicCreateUrl = rootUrl + '/topics';
var mappingCreateUrl = rootUrl + '/mappings';
var mapCreateUrl = rootUrl + '/maps';
var mapUrl = rootUrl + '/maps/';

function randomCoord() {
  var min = -300, max = 300;
  return Math.floor(Math.random() * (max - min)) + min;
}

module.exports = {
  metacodes: [
    // first column is slack emoji name, second column is metacode id
        ['catalyst', 281110143],
	['closed', 1018350795],
	['implication', 507103779],
	['trajectory', 572488568],
	['argument', 897489149],
	['goodpractice', 86478831],
	['idea', 991788158],
	['note', 1065847166],
	['foresight', 790035682],
	['futuredev', 374648174],
	['group', 638205575],
	['insight', 457008489],
	['intention', 587967610],
	['knowledge', 21578242],
	['location', 241469500],
	['openissue', 339908452],
	['opportunity', 510532105],
	['person', 125146708],
	['list', 693380443],
	['pro', 265886353],
	['reference', 332043025],
	['platform', 92282751],
	['problem', 112740059],
	['resource', 513966844],
	['role', 852568144],
	['task', 18300813],
	['con', 1004708648],
	['decision', 1019539926],
	['example', 392363334],
	['experience', 51848956],
	['opinion', 1047793131],
	['moviemap', 96424412],
	['requirement', 47226117],
	['wildcard', 116022259],
	['vision', 1065847227],
	['intent', 1065847225],
	['insight', 1065847224],
	['strategy', 1065847231],
	['pattern', 1065847180],
	['bizarre', 113629430],
	['tool', 306309279],
	['action', 980190962],
	['activity', 298486374],
	['question', 946642823]
  ],
  findMetacodeByNameOrId: function (nameOrId) {
    var m;
    module.exports.metacodes.forEach(function (metacode) {
      if (metacode[0] === nameOrId || metacode[1] === nameOrId) m = metacode;
    });
    return m;
  },
  findMetacodeName: function (id) {
    return module.exports.findMetacodeByNameOrId(id)[0];
  },
  findMetacodeId: function (name) {
    return module.exports.findMetacodeByNameOrId(name)[1];
  },
  addTopicToMap: function (map, topic, token, callback) {
    topic.permission = 'commons';
    request.post({
      url: topicCreateUrl,
      form: { topic: topic },
      headers: {
        Authorization: 'Token token=' + token
      }
    }, function (err, response, body) {
      var body = JSON.parse(body);
      console.log(body);
      if (err) {
        console.log(err);
        return callback('topic failed');
      }
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
        form: { mapping: mapping },
        headers: {
          Authorization: 'Token token=' + token
        }
      }, function (err, response, body) {
        if (err) {
          console.log(err);
          return callback('mapping failed', topicId);
        }
        var body = JSON.parse(body);
        callback(null, topicId, body.mappings[0].id);
      });
    });
  },
  getMap: function (id, token, callback) {
    request.get({
      url: mapUrl + id,
      headers: {
        Authorization: 'Token token=' + token
      }
    }, function (err, response, body) {
      if (err) {
        return callback(err);
      }
      var body = JSON.parse(body);
      var topics = body.topics;
      callback(null, topics);
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
      form: { map: map },
      headers: {
        Authorization: 'Token token=' + token
      }
    }, function (err, response, body) {
      if (err) {
        console.log(err);
        return callback('creating map failed');
      }
      var body = JSON.parse(body);
      callback(null, body.maps[0].id);
    });
  },
  formatTopicsForDisplay: function (topics) {
    var string = '';
    
    topics.forEach(function (t) {
      string += ':' + module.exports.findMetacodeName(t.metacode_id) + ': ' + t.name + ' \n';
    });
    
    return string;
  }
}

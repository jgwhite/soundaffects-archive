App = Ember.Application.create();

// --- Routes ---

App.Router.map(function() {
  this.resource('materials', function() {
    this.resource('material', { path: ':material_id' });
  });
});

App.IndexRoute = Ember.Route.extend({
  redirect: function() {
    this.transitionTo('materials');
  }
});

App.MaterialsRoute = Ember.Route.extend({
  model: function() {
    return App.Material.find();
  }
});

// --- Controllers ---

App.MaterialController = Ember.ObjectController.extend({
  isAudio: function() {
    return this.get('url').match(/\.mp3$/);
  }.property('url'),

  isVideo: function() {
    return this.get('url').match(/\.mp4$/);
  }.property('url')
});

// --- Helpers ---

Ember.Handlebars.registerBoundHelper('unescape', function(string) {
  return unescape(string);
});

Ember.Handlebars.registerBoundHelper('thisYear', function() {
  return new Date().getFullYear();
});

// --- Models ---

App.Material = Ember.Object.extend();

App.Material.find = function(id) {
  if (Ember.isNone(id)) {
    return App.store.all();
  } else {
    return App.store.findById(id);
  }
}

// --- Store ---

App.Store = Ember.Object.extend({
  url: 'https://docs.google.com/spreadsheet/pub?' +
       'key=0Aqx7vtK6RxxZdEZ4emYyd0ljNXRfcnNEM3FzLUhueGc' +
       '&output=csv',

  content: [],
  idMap: {},

  init: function() {
    this._super();
    this._fetchData();
  },

  all: function() {
    return this.get('content');
  },

  findById: function(id) {
    return this._objectForId(id);
  },


  _fetchData: function() {
    var self = this;

    $.get(this.get('url'))
    .done(function(csv) {
      var data = $.csv.toObjects(csv);
      data.forEach(function(datum) { self._addDatum(datum) });
    })
    .fail(function(error) {
      console.error(error);
    });
  },

  _addDatum: function(datum) {
    var object = this._objectForId(datum.id);

    // TODO: Why is this necessary?
    object.setProperties({
      id: datum.id,
      name: datum.name,
      url: datum.url,
      album: datum.album,
      type: datum.type,
      keyStage: datum.keyStage,
      countries: datum.countries,
      subjects: datum.subjects,
      isLoaded: true
    });

    this.get('content').addObject(object);
  },

  _objectForId: function(id) {
    var idMap = this.get('idMap');
    return idMap[id] = idMap[id] || App.Material.create({ id: id });
  }
});

App.store = App.Store.create();

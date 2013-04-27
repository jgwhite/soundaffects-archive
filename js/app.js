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

App.MaterialRoute = Ember.Route.extend({
  model: function(params) {
    return App.Material.find(params.material_id);
  }
});

// --- Controllers ---

App.MaterialsController = Ember.ArrayController.extend({
  isLoadedBinding: Ember.Binding.oneWay('content.isLoaded')
});

App.MaterialController = Ember.ObjectController.extend({
  isLoaded: Ember.K
});

// --- Models ---

App.Material = Ember.ObjectProxy.extend({
  isLoaded: function() {
    return this.get('store.isLoaded');
  }.property('store.isLoaded'),

  content: function() {
    var store = this.get('store'),
        data = store.findById(this.get('id')) || {};

    return data;
  }.property('isLoaded')
});

App.Material.find = function(id) {
  App.Material.__store__ = App.Material.__store__ || App.Store.create();
  var store = App.Material.__store__;

  if (Ember.isNone(id)) {
    return store;
  } else {
    return App.Material.create({ id: id, store: store });
  }
}

App.Store = Ember.ArrayProxy.extend({
  url: 'https://docs.google.com/spreadsheet/pub?' +
       'key=0Aqx7vtK6RxxZdEZ4emYyd0ljNXRfcnNEM3FzLUhueGc' +
       '&output=csv',

  isLoaded: false,

  init: function() {
    this._super();
    this._fetchData();
  },

  findById: function(id) {
    return this.findProperty('id', id);
  },

  _fetchData: function() {
    var self = this;

    $.get(this.get('url')).then(function(csv) {
      var data = $.csv.toObjects(csv);
      self.set('content', data);
      self.set('isLoaded', true);
    });
  }
});

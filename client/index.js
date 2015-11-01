Events = new Mongo.Collection("events");
Relationships = new Mongo.Collection("relationships")

MDl.envConfig['blazeFix'] === true

var CURRENT_OBJ = 'current_obj';
var EDIT_MODE = 'edit_mode';
var ICONS = {
  discussion: 'fa-comments-o',
  opinion: 'fa-star-half-empty',
  proposal: 'fa-gavel',
  question: 'fa-question-circle',
};

var EVENT_TYPES = {
  task: {
    name: 'Task',
    icon: 'fa-todo-o'},
  discussion: {
    name: 'Discussion',
    icon: 'fa-comments-o'},
  opinion: {
    name: 'Opinion',
    icon: 'fa-star-half-empty'},
  proposal: {
     name: 'Proposal',
    icon: 'fa-gavel'},
  question: {
    name: 'Question',
    icon: 'fa-question-circle'},
};

Session.setDefault(CURRENT_OBJ, null);
Session.setDefault(EDIT_MODE, null);

Meteor.subscribe("events");

function getEvent(_id) {
return Events.findOne({_id:_id})
};

Template.body.helpers({
events: function () {return Events.find({}, {sort: {createdAt: -1}})},
});

Template.body.events({
"submit .new-event": function (event) {
  // Prevent default browser form submit
  event.preventDefault();

  // Get value from form element
  var title = event.target.event_title.value;

  // Insert a task into the collection
  id = Events.insert({
    title: title,
    createdAt: new Date(), // current time
    user: Meteor.userId(),
    type: event.target.event_type.value,
    saved: false,
    text: '',
  });



  // Clear form
  event.target.event_title.value = "";
  // var obj = getEvent(id);
  var obj = Events.findOne({_id:_id});

  if (Session.equals(CURRENT_OBJ, null)) {
    // This is a new topic on the front page. It hasn't any relationship yet
    Session.set(CURRENT_OBJ, obj);
    Session.set(EDIT_MODE, id);
  } else {
    // There is a context, so we will automatically add a relationship
    context = Session.get(CURRENT_OBJ);

    Relationships.Collection.insert({
      parent: context._id,
      child: id,
      createdAt: new Date(),
      type: 'context',
      user: Meteor.Meteor.userId(),
    });
    Session.set(EDIT_MODE, id);
  }
}
});


// Default helpers available to all templates
UI.registerHelper('isDefault', function () {
return Session.equals(CURRENT_OBJ, null)});
UI.registerHelper('current_type', function () {
return Session.get(CURRENT_OBJ).type});
UI.registerHelper('current_object', function () {
return Session.get(CURRENT_OBJ)});
UI.registerHelper('log', function () {console.log(this)});


UI.registerHelper('is_type', function(event_type) {return this.type === event_type});
UI.registerHelper('is_active', function(edit_obj) {return Session.equals(edit_obj, true)});
UI.registerHelper('icon', function (event_type) {return ICONS[event_type]});
UI.registerHelper('event', function (event_id) {return getEvent(event_it)});

UI.registerHelper("user_name", function () {
    var user = Meteor.users.findOne({'  _id': this.user})
    if (! user)     return null;
    else            return user.profile.name;
});

Template.listed_event.events({
  "click .toggle-checked": function () {
    // Set the checked property to the opposite of its current value
    Events.update(this._id, {
      $set: {checked: ! this.checked}
    });
  },
  "click .title, click .fa": function (event) {
      Session.set(CURRENT_OBJ, this);
  },
  "focus .title": function (event) {
    Session(SHOW_TEXT, true);
  }
});


Template.focussed_event.helpers({
edit_mode: function () {return Session.equals(EDIT_MODE, this._id)}
});


Template.focussed_event.events({
"click .toggle-checked": function () {
  // Set the checked property to the opposite of its current value
  Events.update(this._id, {$set: {checked: ! this.checked}});
  this.checked = ! this.checked
  Session.set(CURRENT_OBJ, this)
},
"click .title, click span.event_text, click .btn-embedded": function (event) {
  Session.set(EDIT_MODE, this._id);
},
"click .backClick": function(event) {
  Session.set(CURRENT_OBJ, null);
  Session.set(EDIT_MODE, null);
},
"click .delete": function () {
  Events.remove(this._id);
  Session.set(CURRENT_OBJ, null);
},
"submit .edit-title": function (event) {
  // Prevent default browser form submit
  event.preventDefault();

  // Get value from form element
  var title = event.target.event_title.value;

  // Update the event title
  Events.update(this._id, {
    $set: {title: title}
  });

  // Update the view
  this.title=title;
  Session.set(CURRENT_OBJ, this);
  Session.set(EDIT_MODE, null);
},
"submit .edit-text": function (event) {
  // Prevent default browser form submit
  event.preventDefault();

  // Get value from form element
  var text = event.target.event_text.value;

  // Update the event title
  Events.update(this._id, {
    $set: {text: text}
  });

  // Update the view
  this.text=text;
  Session.set(CURRENT_OBJ, this);
  Session.set(EDIT_MODE, null);
},
"submit .edit-embedded, ": function (event) {
  // Prevent default browser form submit
  event.preventDefault();

  // Get value from form element
  var embedded = event.target.event_embedded.value;

  // Update the event title
  Events.update(this._id, {
    $set: {embedded: embedded}
  });

  // Update the view
  this.embedded=embedded;
  Session.set(CURRENT_OBJ, this);
  Session.set(EDIT_MODE, null);
}
});

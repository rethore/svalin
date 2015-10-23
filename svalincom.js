Events = new Mongo.Collection("events");

var CURRENT_TYPE = 'current_type';
var CURRENT_OBJ = 'current_obj';
var EDIT_TITLE = 'edit_title';
var EDIT_TEXT = 'edit_text';
var ICONS = {
  discussion: 'fa-comments-o',
  opinion: 'fa-star-half-empty',
  proposal: 'fa-gavel',
  question: 'fa-question-circle',
};

if (Meteor.isClient) {
    Session.setDefault(CURRENT_TYPE, '');
    Session.setDefault(CURRENT_OBJ, {});
    Session.setDefault(EDIT_TITLE, false);
    Session.setDefault(EDIT_TEXT, false);

  // This code only runs on the client
  // Template.body.helpers({
  // });

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
      console.log(id);

      obj = Events.findOne({_id:id});
      console.log(obj);
      Session.set(CURRENT_OBJ, obj);
      Session.set(CURRENT_TYPE, obj.type);
      Session.set(EDIT_TEXT, true);
    }
  });


  // Default helpers available to all templates
  UI.registerHelper('isDefault', function () {
    return Session.equals(CURRENT_TYPE, '')});
  UI.registerHelper('current_type', function () {
    return Session.get(CURRENT_TYPE)});
  UI.registerHelper('current_object', function () {
    return Session.get(CURRENT_OBJ)});
  UI.registerHelper('log', function () {
    console.log(this);
    return null;
  });


  Template.listed_event.helpers({
    user_name: function () {
        var user = Meteor.users.findOne({'_id': this.user})
        if (! user)     return null;
        else            return user.profile.name;
    },
    icon: function () {return ICONS[this.type]},
    isTask: function () {return this.type === 'task'},

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
          Session.set(CURRENT_TYPE, this.type);
      },
      "focus .title": function (event) {
        Session(SHOW_TEXT, true);
      }
    });


  Template.focussed_event.helpers({
    user_name: function () {
        var user = Meteor.users.findOne({'_id': this.user})
        if (! user)     return null;
        else            return user.profile.name;
    },
    icon: function () {return ICONS[this.type]},
    isTask: function () {return this.type === 'task'},
    edit_title: function () {return Session.get(EDIT_TITLE)},
    edit_text: function () {
      return Session.get(EDIT_TEXT) | this.text === ''
    },
  });


  Template.focussed_event.events({
    "click .toggle-checked": function () {
      // Set the checked property to the opposite of its current value
      Events.update(this._id, {
        $set: {checked: ! this.checked}
      });
      this.checked = ! this.checked
      Session.set(CURRENT_OBJ, this)
    },
    "click .title": function (event) {
      Session.set(EDIT_TITLE, true);
    },
    "click span.event_text": function (event) {
      Session.set(EDIT_TEXT, true);
    },
    "click .backClick": function(event) {
      Session.set(CURRENT_OBJ, {});
      Session.set(CURRENT_TYPE, '');
      Session.set(EDIT_TEXT, false);
      Session.set(EDIT_TITLE, false);
      console.log('backClick');
    },
    "click .delete": function () {
      Events.remove(this._id);
      Session.set(CURRENT_OBJ, {});
      Session.set(CURRENT_TYPE, '');
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
      Session.set(CURRENT_TYPE, this.type);
      Session.set(EDIT_TITLE, false);
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
      Session.set(CURRENT_TYPE, this.type);
      Session.set(EDIT_TEXT, false);
    }
  });
}

if (Meteor.isServer) {
  Meteor.startup(function () {
    // code to run on server at startup
  });
}

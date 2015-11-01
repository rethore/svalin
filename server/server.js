Events = new Mongo.Collection("events");
Relationships = new Mongo.Collection("relationships")

var CURRENT_OBJ = 'current_obj';
var EDIT_MODE = 'edit_mode';
var ICONS = {
  discussion: 'fa-comments-o',
  opinion: 'fa-star-half-empty',
  proposal: 'fa-gavel',
  question: 'fa-question-circle',
};

Meteor.startup(function () {
  // code to run on server at startup
});

Meteor.publish("events", function () {
  return Events.find();
});

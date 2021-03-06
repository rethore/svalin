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

var EVENT_TYPES = [
  { type: 'task',
    name: 'Task',
    icon: 'fa-check-square-o'},
  { type: 'discussion',
    name: 'Discussion',
    icon: 'fa-comments-o'},
  { type: 'opinion',
    name: 'Opinion',
    icon: 'fa-star-half-empty'},
  { type: 'proposal',
     name: 'Proposal',
    icon: 'fa-gavel'},
  { type: 'question',
    name: 'Question',
    icon: 'fa-question-circle'},
];

Template.d3t.rendered = function () {

  var sampleSVG = d3.select("#viz")
      .append("svg")
      .attr("width", 100)
      .attr("height", 100);

  sampleSVG.append("circle")
      .style("stroke", "gray")
      .style("fill", "white")
      .attr("r", 20)
      .attr("cx", 50)
      .attr("cy", 50)
      .on("mouseover", function(){d3.select(this).style("fill", "aliceblue");})
      .on("mouseout", function(){d3.select(this).style("fill", "white");})
      .on("mousedown", animateFirstStep);


  // sampleSVG.append("polygon")
  //     .style("fill", "yellow")
  //     .style("stroke","blue")
  //     .style("stroke-width", 2)
  //     .attr("points","05,30
  //                     15,10
  //                     25,30")


  function animateFirstStep(){
      d3.select(this)
        .transition()
          .delay(0)
          .duration(1000)
          .attr("r", 10)
          .each("end", animateSecondStep);
  };

  function animateSecondStep(){
      d3.select(this)
        .transition()
          .duration(1000)
          .attr("r", 50);
  };

}

Session.setDefault(CURRENT_OBJ, null);
Session.setDefault(EDIT_MODE, null);
Session.setDefault('current_event_type', EVENT_TYPES[0]);

Meteor.subscribe("events");

let getEvent = (_id) => Events.findOne({_id:_id});

Template.body.helpers({
  events: () => Events.find({}, {sort: {createdAt: -1}}),
});

Template.navbar.helpers({
  event_types: () => EVENT_TYPES,
  current_event_type: () => Session.get('current_event_type'),
});

Template.navbar.events({
"click .click-event-type": function() {
  Session.set('current_event_type', {
    type: this.type,
    icon: this.icon,
    name: this.name
  });
},
"submit .new-event": function (event) {
  // Prevent default browser form submit
  event.preventDefault();

  // Get value from form element
  var title = event.target.text.value;

  // Insert a task into the collection
  id = Events.insert({
    title: title,
    createdAt: new Date(), // current time
    user: Meteor.userId(),
    type: Session.get('current_event_type').type,
    saved: false,
    text: '',
  });

  // Clear form
  event.target.text.value = "";
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
UI.registerHelper('isDefault', () => Session.equals(CURRENT_OBJ, null));
UI.registerHelper('current_type',  () => Session.get(CURRENT_OBJ).type);
UI.registerHelper('current_object', () => Session.get(CURRENT_OBJ));
UI.registerHelper('is_active', edit_obj => Session.equals(edit_obj, true));
UI.registerHelper('find_icon', event_type => ICONS[event_type]);
UI.registerHelper('event', event_id => getEvent(event_it));

UI.registerHelper('log', function() {console.log(this)});
UI.registerHelper('is_type', function(event_type) {return (this.type === event_type)});
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
  edit_mode() {return Session.equals(EDIT_MODE, this._id)}
});


Template.focussed_event.events({
"click .toggle-checked": function () {
  // Set the checked property to the opposite of its current value
  Events.update(this._id, {$set: {checked: ! this.checked}});
  this.checked = ! this.checked
  Session.set(CURRENT_OBJ, this)
},
"click .title, click span.event_text, click .btn-embedded": function(event){
  Session.set(EDIT_MODE, this._id)},
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
  let title = event.target.event_title.value;

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
  let text = event.target.event_text.value;

  // Update the event title
  Events.update(this._id, {
    $set: {text: text}
  });

  // Update the view
  this.text=text;
  Session.set(CURRENT_OBJ, this);
  Session.set(EDIT_MODE, null);
},
"submit .edit-embedded": function (event) {
  // Prevent default browser form submit
  event.preventDefault();

  // Get value from form element
  let embedded = event.target.event_embedded.value;

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

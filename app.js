var KEYS  = {

}
// Setup emoji.js image directory
var imgPath = 'bower_components/emojify.js/dist/images/basic/';

$.getJSON('./emojies', function(data) {
	$('#chat-input-area').atwho(
	  { // emoji strategy
	    //  /\B:([\-+\w]*)$/
	      at: ":",
	      // Hit API endpoint for our emojies list
	      data: './emojies',
	      displayTpl: '<li><img src="//cdn.jsdelivr.net/emojione/assets/png/${unicode}.png?v=1.2.4" class="emojione popup"></img> ${shortname} </li>',
	  		insertTpl: ':${shortname}:',
        searchKey: 'shortname',
	      limit: 20
	  });
})

if(Cookies.get('username')){
	// hide the modal
	$('#overlay').hide();
	} else {
	$('#overlay').show();
}

var socket = io();

// These variables toggle the users ability to enter text into
// the textarea. They are reset to false whenever the form is submitted.
var isInsertingEmoji = false;
var isTypingRawText = false;
$('#chat-input-area').on('shown.atwho', function(e) {
	isInsertingEmoji = true;
});

$('#chat-input-area').on('inserted.atwho', function(e) {
	isInsertingEmoji = false;
});

var FIRSTVISIBLECHARCODE = 33 // 0
var COLONCHARCODE = 58;
var ENTERCHARCODE = 13;
var DOUBLEQUOTE = 34;

$('#chat-input-area').keypress(function (e) {
	// Handles all emojie
	if(isInsertingEmoji){
		// Disable whitespaces characters inside of autocompletion
		if(e.charCode < FIRSTVISIBLECHARCODE) {
			e.preventDefault();
		}
		return;
	}

	// Toggle isTypingRawText on DOUBLEQUOTE (")
	if(e.charCode === DOUBLEQUOTE) {
		isTypingRawText = !isTypingRawText;
	}

	// Allow anything inside raw text delimeter
	if(isTypingRawText){
		return;
	}

	// Override Enter to submit the chat form (if it isn't empty)
	// Don't prevent default on Shift+Enter, insert a newline.
	if(e.charCode === ENTERCHARCODE && !e.shiftKey) {
		e.preventDefault();

		if($('#chat-input-area').val() !== ''){
		  $('#chat-form').submit();
		}
		return;
	}

	// Prevents character entry unless autocompleting is turned on or whitespace
	// Since we've registered and At.js handle on ":", entering it will
	// toggle on IsInsertingEmoji to True
	if(e.charCode !== COLONCHARCODE && e.charCode !== DOUBLEQUOTE && e.charCode >= FIRSTVISIBLECHARCODE){
		e.preventDefault();
		return;
	}
});

$('form').submit(function(){
	socket.emit('chat message', {username: Cookies.get('username'), text: $('#chat-input-area').val()} );
	$('#chat-input-area').val('');
	IsInsertingEmoji = false;
	isTypingRawText = false;
	return false;
});

socket.on('welcome', function(history) {
	history.forEach(function(msg) {
	  addMessage(msg);
	});
});

socket.on('chat message', function(msg){
	addMessage(msg);
});

function saveUsername() {
Cookies.set('username', $('#username-input').val(), {expires: 1});
	$('#overlay').hide();
}

function toggleButton() {
	if($('#username-input').val() === ''){
	  $('#submit-username').attr('disabled', 'true');
	} else {
	  $('#submit-username').removeAttr('disabled');
	}
}

function addMessage(msg){
  msg.text = emojione.toImage(msg.text).replace(/"/gi, '');
  var li = $('<li>');
  li.html(msg.username + ": " + msg.text);
	$('#messages').append(li);
}

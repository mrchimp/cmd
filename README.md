cmd
===

HTML5 Command Line Terminal

Cmd turns a div into a kind of command line. It is designed to take a string input and return a plain text or HTML response by processing the input using Javascript or by using a remote server via a JSON API. It is designed to be extended and as such only provides a few basic commands (see below).

Cmd was built for [Chimpcom](http://deviouschimp.co.uk/cmd) ([Github](https://github.com/mrchimp/chimpcom)).

MIT License

[Demo](http://deviouschimp.co.uk/misc/cmd)

Features
======

* Tab completion for command names and parameters
* JSON API
* Text-to-speech output (optional, where available)


Bower
=====

You can get Cmd with bower.

    bower install cmd


Usage
=====

Make an empty div.

    <div id="cmd"></div>

Run some javascript.

    var console = new Cmd({
        selector: '#cmd'
    });

For more examples see `example.html`.



Options
====

### selector

**Required.** *(string: '#cmd')* Selector for div to use as terminal.


### busy\_text

*(string: 'Communicating...')* Text to display when input is disabled during external processor requests.


### external\_processor

*(function: noop)*

Parameters:

 * *string* `input` The command given by the user.
 * *object* `cmd` Reference to the Cmd object.

To add extra commands to Cmd, pass a callback function in the options. This function should either return a *response object* (see below) or `undefined`.

If `input` is `undefined`, the command line will remain disabled until `handleResponse()`` is called.

The value that `external_processor` returns defines how Cmd reacts:

  * `true` - Cmd will remain deactivated until your external script calls `handleResponse`.
  * `false` - `unknown_cmd` will be printed to screen.
  * `object` - Will be interpreted as a Cmd response object. See below for definition.
  * `string` - Will be output to screen.
  * Anything else - `unknown_cmd` will be printed to screen.


### filedrop_enabled

*(boolean: false)* If `true`, the terminal will allow files to be dropped on it and will post them to `file_upload_url`.


### file\_upload\_url

*(string: 'uploadfile.php')* Used when `filedrop_enabled` is `true`. A URL to post to when files are dropped on the terminal.


### history_id

*(string: 'cmd_history')* Command history is stored in Local Storage. Use different ids if using multiple terminals on a page. Or don't and they'll share history. It's up to you.


### remote\_cmd\_list\_url

*(string: '')* A URL that provides a JSON representation of available remote commands that is used for *command name* tabcomplete. This is called once at boot time.


### tabcomplete_url ###

*(string: '')* A URL that provides parameter tabcompletion result when the input is more than one word.


### talk

*(boolean: false)* Enable talk mode by default.


### typewriter\_time

*(string: 32)* Time between typewriter output keypresses.


### typewriter\_threshold

*(string: 200)* Output length longer than this will not use the typewriter effect.


### unknown\_cmd

*(string: 'Unrecognised command')* String to respond with when unable to process a command.




Response Object
============

The response object that is passed to `handleResponse` can have the following parameters.

 * cmd\_in - *required* The input provided by the user.
 * cmd\_out - *required* The response string.
 * redirect - URL to redirect browser to.
 * openWindow - URL to open in a new window.
 * log - String to output with `console.log()`.
 * hide\_output - Mask cmd\_in as asterisks when outputting.
 * show_pass - Switch to password input.
 * cmd\_fill - String to insert into input.



Methods
======

### appendOutput

Params: (*string* msg) - Append `msg` to the output.


### clearScreen

Same as calling the `clear` command. Removes all output. Clears the screen. How else can I put it.


### handleResponse

Params: (*object* response) - Called by `external_processor` to output a response. See above for `response` specification.


### invert

Toggle between light-on-dark and dar-on-light styles.


### setPrompt

Params: (*string* new_prompt) - Change the prompt string.


### showInputType

Params: (*string* input_type) - Changes the type of input used. `input_type` should be 'password' (masks input as asterisks), 'textarea' (for large format text) or 'normal' (single line input). (If `input_type` is not set, `'normal'` will be used).


Default Commands
================

### clear / cls / clr

Clear the screan. Same as `clear` on Unix or `cls` on Windows.

### clearhistory

The command history that is accessed with the up arrow is stored in the browser's local storage. `clearhistory` empties this list.

### invert

Toggle between light-on-dark and dark-and-light styles.

### talk

Toggle talk mode. When talk mode is enabled, responses will be read aloud.

### shh

"Panic button" that silences current speech and empties the talk queue. Talk mode remains enabled.


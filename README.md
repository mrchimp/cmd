cmd
===

HTML5 Command Line Terminal

Cmd turns a div into a command line. It allows keyboard input, sends commands to third party scripts and stores command history. It is designed to be extendable and as such only provides a few basic commands (clear, clearhistory, invert).

Cmd is part of Chimpcom v6. [Version 5 is live](http://deviouschimp.co.uk/cmd). 6 will be put live soon and the rest of the code will become open source at some point.

Cmd relies on jQuery...for now.

Copyright 2014 Jacob Gully

MIT License

[Demo](http://deviouschimp.co.uk/misc/cmd)



Bower
=====

You can get Cmd on bower.

    bower install cmd

It's that easy.


Usage
-----

Make an empty div.

    <div id="cmd"></div>

Run some javascript.

    var console = new Cmd({
        selector: '#cmd'
    });

For more examples see `example.html`.



Options
-------

### selector

**Required.** *(string: '#cmd')* Selector for div to use as terminal.


### style_id

*(string: 'cmd-style')* Id for stylesheet `<link>` element. The element will be created automatically.


### external_processor

*(function: function(){})* See below.


### filedrop_enabled

*(boolean: false)* If `true`, the terminal will allow files to be dropped on it and will post them to `file_upload_url`.


### file_upload_url

*(string: 'uploadfile.php')* Used when `filedrop_enabled` is `true`. A URL to post to when files are dropped on the terminal.


### history_id

*(string: 'cmd_history')* Command history is stored in Local Storage. Use different ids if using multiple terminals on a page. Or don't and they'll share history. It's up to you.


### invalid_response

*(string: 'Invalid response.')* String to respond with when `external_processor` returns something unexpected.


### style

*(string: 'dark')* Default style type. Options are 'light' and 'dark'. Loads `light_css` or `dark_css` respectively.


### light_css

*(string: 'cmd_light.min.css')* URL to light coloured stylesheet.


### dark_css

*(string: 'cmd_dark.min.css')* URL to dark coloured stylesheet.


### timeout_length

*(number: 10000)* Timeout time in milliseconds. This is a leftover from the old chimpcom and might be removed or re-worked. Currently the variable is just stored and possibly manipulated with the `timeout` command but is not actually used.


### unknown_cmd

*(string: 'Unrecognised command')* String to respond with when unable to process a command.



External Processor
------------------

*function*

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



Response Object
===============

A response object can have the following parameters.

 * cmd_in - *required* The input provided by the user.
 * cmd_out - *required* The response string.
 * redirect - URL to redirect browser to.
 * openWindow - URL to open in a new window.
 * log - String to output with `console.log()`.
 * hide_output - Mask cmd_in as asterisks when outputting.
 * show_pass - Switch to password input.
 * cmd_fill - String to insert into input.



Methods
=======

### appendOutput

Params: (*string* msg) - Append `msg` to the output.


### clearScreen

Same as calling the `clear` command. Removes all output. Clears the screen. How else can I put it.


### handleResponse

Params: (*object* res) - Called by `external_processor` to output a response. See above for `res` specification.


### invert

If `style` (see options) is `'dark'`, load `light_css` and vice versa.


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

Toggle between light and dark styles.

## talk

Toggle talk mode. When talk mode is enabled, responses will be read aloud.

## shh

"Panic button" that silences current speech and empties the talk queue. Talk mode remains enabled.


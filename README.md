cmd
===

HTML5 Command Line Terminal

Copyright 2014 Jacob Gully

MIT License


Usage
-----

Make an empty div.

    <div id="cmd">

Run some javascript.

    var console = new Cmd({
        selector: '#cmd'
    });


Options
-------

=== selector

*string* **Required.** Selector for div to use as terminal.

=== style_id

*string* Id for stylesheet `<link>` element. The element will be created automatically.

=== external_processor

*function* See below.


External Processor
------------------

*function*

Parameter: `input` *string* The command given by the user.

To add extra commands to Cmd, pass a callback function in the options. This function should either return a *response object* (see below) or `undefined`.

If `undefined` is passed Cmd will expect 


Response Object
---------------

A response object can have the following parameters.

 * cmd_in - *required* The input provided by the user.
 * cmd_out - *required* The response string.
 * redirect - URL to redirect browser to.
 * openWindow - URL to open in a new window.
 * log - String to output with `console.log()`.
 * hide_output - Mask cmd_in as asterisks when outputting.
 * show_pass - Switch to password input.
 * cmd_fill - String to insert into input.

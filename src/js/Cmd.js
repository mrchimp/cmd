
/**
 * HTML5 Command Line Terminal
 * 
 * @author   Jake Gully (chimpytk@gmail.com)
 * @license  MIT License
 */

var Cmd = (function ($) {
  return function(user_config) {
    "use strict";

    var keys_array  = [9, 13, 38, 40, 27],
      style         = 'dark',
      popup         = false,
      prompt_str    = '$ ',
      speech_synth_support = ('speechSynthesis' in window && typeof SpeechSynthesisUtterance !== 'undefined'),
      options       = {
        busy_text:          'Communicating...',
        dark_css:           'cmd_dark.min.css',
        external_processor: function() {},
        file_upload_url:    'ajax/uploadfile.php',
        filedrop_enabled:   false,
        history_id:         'cmd_history',
        light_css:          'cmd_light.min.css',
        selector:           '#cmd',
        style:              'dark',
        style_id:           'cmd-style',
        talk:               false,
        timeout_length:     10000,
        unknown_cmd:        'Unrecognised command'
      },
      cmd_stack,
      container,
      dropzone,
      input,
      output,
      prompt_elem,
      voice,
      voices = false,
      wrapper;

    $.extend(options, user_config);

    if (!$(options.selector).length) {
      throw 'Cmd err: Invalid selector.';
    }

    cmd_stack = new CmdStack(options.history_id, 30);

    if (cmd_stack.isEmpty()) {
      cmd_stack.push('secretmagicword!');
    }

    cmd_stack.reset();
    
    setupDOM();

    input.focus();


    // ====== Layout / IO / Alter Interface =========

    /**
     * Create DOM elements, add click & key handlers
     */
    function setupDOM() {
      wrapper = $(options.selector).addClass('cmd-interface');

      container = $('<div/>')
      .addClass('cmd-container')
      .appendTo(wrapper);

      if (options.filedrop_enabled) {
        setupFiledrop(); // adds dropzone div
      }
      
      clearScreen(); // adds output, input and prompt

      $(options.selector).on('click', focusOnInput);
      $(window).resize(resizeInput);

      wrapper.keydown(handleKeyDown);
      wrapper.keyup(handleKeyUp);
      wrapper.keydown(handleKeyPress);

      if ($('#' + options.style_id).length) {
        $('#' + options.style_id).remove();
      }

      $('<link/>')
        .attr({
          id:   options.style_id,
          rel:  'stylesheet',
          type: 'text/css',
          href: (options.style === 'dark' ? options.dark_css : options.light_css)
        })
        .appendTo($('head'));
    }

    /**
     * Changes the input type
     */
    function showInputType(input_type) {
      switch (input_type) {
        case 'password':
          input = $('<input/>')
            .attr('type', 'password')
            .attr('maxlength', 512)
            .addClass('cmd-in');
          break;
        case 'textarea':
          input = $('<textarea/>')
            .addClass('cmd-in')
          break;
        default:
          input = $('<input/>')
            .attr('type', 'text')
            .attr('maxlength', 512)
            .addClass('cmd-in');
      }

      container.children('.cmd-in').remove();

      input.appendTo(container)
        .attr('title', 'Chimpcom input');

      focusOnInput();
    }

    /**
     * Takes the client's input and the server's output 
     * and displays them appropriately.
     * 
     * @param   string  cmd_in      The command as entered by the user
     * @param   string  cmd_out     The server output to write to screen
     */
    function displayOutput(cmd_in, cmd_out) {
      if (typeof cmd_in !== 'string') {
        cmd_in = 'Error: invalid cmd_in returned.';
      }

      if (typeof cmd_out !== 'string') {
        cmd_out = 'Error: invalid cmd_out returned.';
      }

      cmd_in = cmd_in.replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");

      output.append($('<span/>').addClass('prompt').html(prompt_str));
      output.append(' ');
      output.append($('<span/>').addClass('grey_text').html(cmd_in));
      output.append('<br>' + cmd_out + '<br>');

      if (options.talk) {
        speakOutput(cmd_out);
      }      

      cmd_stack.reset();

      input.val('').removeAttr('disabled');

      enableInput();
      focusOnInput();
    }

    /**
     * Append a string to the terminal output
     * @param  {string} msg The string to output
     */
    function appendOutput(msg) {
      output.append(msg);
    }

    /**
     * Set the prompt string
     * @param {string} new_prompt The new prompt string
     */
    function setPrompt(new_prompt) {
      if (typeof new_prompt !== 'string') {
        throw 'Cmd error: invalid prompt string.';
      }

      prompt_str = new_prompt;
      prompt_elem.html(prompt_str);
    }

    /**
     * Post-file-drop dropzone reset
     */
    function resetDropzone() {
      dropzone.css('display', 'none');
    }

    /**
     * Add file drop handlers
     */
    function setupFiledrop() {
      dropzone = $('<div/>')
      .addClass('dropzone')
      .appendTo(wrapper)
      .filedrop({
        url: options.file_upload_url,
        paramname: 'dropfile', // POST parameter name used on serverside to reference file
        maxfiles: 10,
        maxfilesize: 2, // MBs
        error: function (err, file) {
          switch (err) {
          case 'BrowserNotSupported':
            alert('Your browser does not support html5 drag and drop.');
            break;
          case 'TooManyFiles':
            displayOutput('[File Upload]', 'Too many files!');
            resetDropzone();
            break;
          case 'FileTooLarge':
            // FileTooLarge also has access to the file which was too large
            // use file.name to reference the filename of the culprit file
            displayOutput('[File Upload]', 'File too big!');
            resetDropzone();
            break;
          default:
            displayOutput('[File Upload]', 'Fail D:');
            resetDropzone();
            break;
          }
        },
        dragOver: function () { // user dragging files over #dropzone
          dropzone.css('display', 'block');
        },
        dragLeave: function () { // user dragging files out of #dropzone
          resetDropzone();
        },
        docOver: function () { // user dragging files anywhere inside the browser document window
          dropzone.css('display', 'block');
        },
        docLeave: function () { // user dragging files out of the browser document window
          resetDropzone();
        },
        drop: function () { // user drops file
          dropzone.append('<br>File dropped.');
        },
        uploadStarted: function (i, file, len) {
          dropzone.append('<br>Upload started...');
          // a file began uploading
          // i = index => 0, 1, 2, 3, 4 etc
          // file is the actual file of the index
          // len = total files user dropped
        },
        uploadFinished: function (i, file, response, time) {
          // response is the data you got back from server in JSON format.
          if (response.error !== '') {
            upload_error = response.error;
          }
          dropzone.append('<br>Upload finished! ' + response.result);
        },
        progressUpdated: function (i, file, progress) {
          // this function is used for large files and updates intermittently
          // progress is the integer value of file being uploaded percentage to completion
          dropzone.append('<br>File uploading...');
        },
        speedUpdated: function (i, file, speed) { // speed in kb/s
          dropzone.append('<br>Upload speed: ' + speed);
        },
        afterAll: function () {
          // runs after all files have been uploaded or otherwise dealt with
          if (upload_error !== '') {
            displayOutput('[File Upload]', 'Error: ' + upload_error);
          } else {
            displayOutput('[File Upload]', 'Success!');
          }

          upload_error = '';

          dropzone.css('display', 'none');
          resetDropzone();
        }
      });
    }

    /**
     * [invert description]
     * @return {[type]} [description]
     */
    function invert() {
      var style = $('#' + options.style_id);

      if (options.style === 'dark') {
        options.style = 'light';
        style.attr('href', options.light_css);
      } else {
        options.style = 'dark';
        style.attr('href', options.dark_css);
      }
    }



    // ====== Handlers ==============================

    /**
     * Do something
     */
    function handleInput(input_str) {
      if (!input_str) {
        return false;
      }

      var cmd_array = input_str.split(' ');

      switch (cmd_array[0]) {
        case 'clear':
        case 'cls':
        case 'clr':
          clearScreen();
          break;
        case 'clearhistory':
          cmd_stack.empty();
          cmd_stack.reset();
          displayOutput(input_str,  'Command history cleared. ');
          break;
        case 'invert':
          invert();
          displayOutput(input_str, 'Shazam.');
          break;
        case 'shh':
          if (options.talk) {
            window.speechSynthesis.cancel();
            options.talk = false;
            displayOutput(input_str, 'Speech stopped. Talk mode is still enabled. Type TALK to disable talk mode.');
            options.talk = true;
          } else {
            displayOutput(input_str, 'Ok.');
          }
          break;
        case 'talk':
          if (!speech_synth_support) {
            displayOutput(input_str, 'You browser doesn\'t support speech synthesis.');
            return false;
          }

          options.talk = !options.talk;
          displayOutput(input_str, (options.talk ? 'Talk mode enabled.' : 'Talk mode disabled.'));
          break;
        default:
          if (typeof options.external_processor !== 'function') {
            displayOutput(input_str, options.unknown_cmd);
            return false;
          }

          var result = options.external_processor(input_str, cmd);

          switch (typeof result) {
            // If undefined, external handler should 
            // call handleResponse when done
            case 'boolean':
              if (!result) {
                displayOutput(input_str, options.unknown_cmd);
              }
              break;
            // If we get a response object, deal with it directly
            case 'object':
              handleResponse(result);
              break;
            // If we have a string, output it. This shouldn't
            // really happen but it might be useful
            case 'string':
              displayOutput(input_str, result);
              break;
            default:
              displayOutput(input_str, options.unknown_cmd);
          }
      }
    }

    /**
     * Handle JSON responses. Used as callback by external command handler
     * @param  {object} res Chimpcom command object
     */
    function handleResponse(res) {
      if (res.redirect !== undefined) {
        document.location.href = res.redirect;
      }

      if (res.openWindow !== undefined) {
        window.open(res.openWindow, '_blank', res.openWindowSpecs);
      }

      if (res.log !== undefined && res.log !== '') {
        console.log(res.log);
      }

      if (res.hide_output === true) {
        res.cmd_in = new Array(cmd_in.length).join("*");
      }

      if (res.show_pass === true) {
        showInputType('password');
      } else {
        showInputType();
      }

      displayOutput(res.cmd_in, res.cmd_out);

      if (res.cmd_fill !== '') {
        wrapper.children('.cmd-container').children('.cmd-in').first().val(res.cmd_fill);
      }

      activateAutofills();
    }

    /**
     * Handle keypresses
     */
    function handleKeyPress(e) {
      var keyCode = e.keyCode || e.which,
        input_str = input.val();

      if (keyCode === 13) { // enter
        if (input.attr('disabled')) {
          return false;
        }


        if (e.ctrlKey) {
          cmd_stack.push(input_str);
          goToURL(input_str);
        } else {
          disableInput();

          // push command to stack if using text input, i.e. no passwords
          if (input.get(0).type === 'text') {
            cmd_stack.push(input_str);
          }

          handleInput(input_str);
        } //} else if (keyCode === 9) { tabComplete();
      } else if (keyCode === 38) { // up arrow
        if (input_str !== "" && cmd_stack.cur === (cmd_stack.getSize() - 1)) {
          cmd_stack.push(input_str);
        }

        input.val(cmd_stack.prev());
      } else if (keyCode === 40) { // down arrow
        input.val(cmd_stack.next());
      } else if (keyCode === 27) { // esc
        container.fadeToggle();
      }
    }

    /**
     * Prevent default action of special keys
     */
    function handleKeyUp(e) {
      var key = e.which;

      if ($.inArray(key, keys_array) > -1) {
        e.preventDefault();
        return false;
      }

      return true;
    }

    /**
     * Prevent default action of special keys
     */
    function handleKeyDown(e) {
      var key = e.which;

      if ($.inArray(key, keys_array) > -1) {
        e.preventDefault();

        return false;
      }
      return true;
    }

    

    // ====== Helpers ===============================
    
    /**
     * Takes a user to a given url. Adds "http://" if necessary.
     */
    function goToURL(url) {
      if (url.substr(0, 4) !== 'http' && url.substr(0, 2) !== '//') {
        url = 'http://' + url;
      }

      if (popup) {
        window.open(url, '_blank');
        window.focus();
      } else {
        // break out of iframe - used by chrome plugin
        if (top.location !== location) {
          top.location.href = document.location.href;
        }

        location.href = url;
      }
    }

    /**
     * Give focus to the command input and 
     * scroll to the bottom of the page
     */
    function focusOnInput() {
      var cmd_width;

      $(options.selector).scrollTop($(options.selector)[0].scrollHeight);

      input.focus();
    }

    /**
     * Make prompt and input fit on one line
     */
    function resizeInput() {
      var cmd_width = wrapper.width() - wrapper.find('.main-prompt').first().width() - 45;

      input.focus().css('width', cmd_width);
    }

    /**
     * Clear the screen
     */
    function clearScreen() {
      container.empty();

      output = $('<div/>')
        .addClass('cmd-output')
        .appendTo(container);

      prompt_elem = $('<span/>')
        .addClass('main-prompt')
        .addClass('prompt')
        .html(prompt_str)
        .appendTo(container);

      input = $('<input/>')
        .addClass('cmd-in')
        .attr('type', 'text')
        .attr('maxlength', 512)
        .appendTo(container);

      showInputType();

      input.val('');
    }

    /**
     * Attach click handlers to 'autofills' - divs which, when clicked,
     * will insert text into the input
     */
    function activateAutofills() {
      wrapper.find('[data-type=autofill]').on('click', function () {
        input.val($(this).data('autofill'));
      });
    }

    /**
     * Temporarily disable input while runnign commands
     */
    function disableInput() {
      input
        .attr('disabled', true)
        .val(options.busy_text);
    }

    /**
     * Reenable input after running disableInput()
     */
    function enableInput() {
      input
        .removeAttr('disabled')
        .val('');
    }

    /**
     * Speak output aloud using speech synthesis API
     * 
     * @param {String} output Text to read
     */
    function speakOutput(output) {
      var msg = new SpeechSynthesisUtterance();

      msg.volume = 1; // 0 - 1
      msg.rate   = 1; // 0.1 - 10
      msg.pitch  = 2; // 0 - 2
      msg.lang   = 'en-UK';
      msg.text   = output;

      window.speechSynthesis.speak(msg);
    }

    var cmd = {
      appendOutput: appendOutput,
      clearScreen: clearScreen,
      handleResponse: handleResponse,
      invert: invert,
      options: options,
      setPrompt: setPrompt,
      showInputType: showInputType
    };

    return cmd;
  };
})(jQuery);


/**
 * Stack for holding previous commands for retrieval with the up arrow. 
 * Stores data in localStorage. Won't push consecutive duplicates.
 *
 * @author   Jake Gully, chimpytk@gmail.com
 * @license  MIT License
 */

/**
 * Constructor
 * @param {string}  id       Unique id for this stack
 * @param {integer} max_size Number of commands to store
 */
function CmdStack(id, max_size) {
  "use strict";

  var instance_id = id,
      cur = 0,
      arr = []; // This is a fairly meaningless name but
                // makes it sound like this function was
                // written by a pirate.  I'm keeping it.

  if (typeof id !== 'string') {
    throw 'Stack error: id should be a string.';
  }

  if (typeof max_size !== 'number') {
    throw 'Stack error: max_size should be a number.';
  }


  /**
   * Store the array in localstorage
   */
  function setArray(arr) {
    localStorage['cmd_stack_' + instance_id] = JSON.stringify(arr);
  }

  /**
   * Load array from localstorage
   */
  function getArray() {
    if (!localStorage['cmd_stack_' + instance_id]) {
      arr = [];
      setArray(arr);
    }

    try {
      arr = JSON.parse(localStorage['cmd_stack_' + instance_id]);
    } catch (err) {
      return [];
    }
    return arr;
  }

  /**
   * Push a command to the array
   * @param  {string} cmd Command to append to stack
   */
  function push(cmd) {
    arr = getArray();
    
    // don't push if same as last command
    if (cmd === arr[arr.length - 1]) {
      return false;
    }

    arr.push(cmd);

    // crop off excess
    while (arr.length > max_size) {
      arr.shift();
    }

    cur = arr.length;
    setArray(arr);
  }

  /**
   * Get previous command from stack (up key)
   * @return {string} Retrieved command string
   */
  function prev() {
    cur -= 1;

    if (cur < 0) {
      cur = 0;
    }

    return arr[cur];
  }

  /**
   * Get next command from stack (down key)
   * @return {string} Retrieved command string
   */
  function next() {
    cur = cur + 1;

    // Return a blank string as last item
    if (cur === arr.length) {
      return "";
    }

    // Limit
    if (cur > (arr.length - 1)) {
      cur = (arr.length - 1);
    }

    return arr[cur];
  }

  /**
   * Move cursor to last element
   */
  function reset() {
    arr = getArray();
    cur = arr.length;
  }

  /**
   * Is stack empty
   * @return {Boolean} True if stack is empty
   */
  function isEmpty() {
    arr = getArray();
    return (arr.length === 0);
  }
  
  /**
   * Empty array and remove from localstorage
   */
  function empty() {
    arr = undefined;
    localStorage.clear();
    reset();
  }

  /**
   * Get current cursor location
   * @return {integer} Current cursor index
   */
  function getCur() {
    return cur;
  }

  /**
   * Get entire stack array
   * @return {array} The stack array
   */
  function getArr() {
    return arr;
  }

  /**
   * Get size of the stack
   * @return {Integer} Size of stack
   */
  function getSize(){
    return arr.size;
  }

  return {
    push: push,
    prev: prev,
    next: next,
    reset: reset,
    isEmpty: isEmpty,
    empty: empty,
    getCur: getCur,
    getArr: getArr,
    getSize: getSize
  };
}

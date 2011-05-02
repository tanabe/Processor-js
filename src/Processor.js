/**
 *  command pattern like library
 *  (c) Hideaki Tanabe <http://blog.kaihatsubu.com>
 *  Licensed under the MIT License.
 */

/**
 *  Process constructor
 */
var Process = function() {

  var result = {};
  var callbacks = [];

  /**
   *  execute abstract function
   */
  function execute() {
    done();
  }

  /**
   *  pause abstract function
   */
  function pause() {
  }

  /**
   *  resume abstract function
   */
  function resume() {
  }

  /**
   *  done
   */
  function done() {
    //fire callbacks
    for (var i = 0, length = callbacks.length; i < length; i++) {
      callbacks[i].callback.apply(callbacks[i].scope, [this]);
    }
  }

  /**
   *  set result object
   *  @result result object
   */
  function setResult(result) {
    this.result = result;
  }

  /**
   *  set callback function
   *  @param scope owner of callback function
   *  @param callback this function will fire after previous process
   */
  function addCallback(scope, callback) {
    callbacks.push({scope: scope, callback: callback});
  }

  /**
   *  unset callback function
   *  @param callback callback function
   */
  function removeCallback(callback) {
    for (var i = 0, length = callback.length; i < length; i++) {
      if (callbacks[i].callback == callback) {
        callbacks.splice(i, 1);
        return;
      }
    }
  }

  var Process = {};
  Process.result = result;
  Process.execute = execute;
  Process.pause = pause;
  Process.resume = resume;
  Process.done = done;
  Process.setResult = setResult;
  Process.addCallback = addCallback;
  Process.removeCallback = removeCallback;
  return Process;
};

/**
 *  Processor constructor extends Process
 */
var Processor = function() {

  var processQueue = [];
  var currentProcesses = [];
  var running = false;
  var executed = false;
  var leftProcessesTotal = 0;
  var total = 0;

  /**
   *  execute
   */
  function execute() {
    if (executed) {
      return;
    }
    running = true;
    executed = true;
    this.executeProcesses();
  }

  /**
   *  execte processes
   */
  function executeProcesses() {
    if (processQueue.length > 0) {
      currentProcesses = processQueue.shift();
      leftProcessesTotal = currentProcesses.length;
      for (var i = 0, length = currentProcesses.length; i < length; i++) {
        var process = currentProcesses[i];
        process.setResult(this.result);
        process.addCallback(this, processCompleteHandler);
        process.execute();
      }
    } else {
      this.done();
    }
  }

  /**
   *  progress complete callback function
   */
  function processCompleteHandler(process) {
    process.removeCallback(arguments.callee);
    leftProcessesTotal--;
    if (leftProcessesTotal === 0) {
      currentProcesses = [];
      this.executeProcesses();
    }
  }

  /**
   *  add process
   *  @params any processes
   */
  function add() {
    processQueue.push([].slice.call(arguments));
    return this;
  }

  /**
   *  pause processes
   */
  function pauseProcesses() {
    for (var i = 0, length = currentProcesses.length; i < length; i++) {
      currentProcesses[i].pause();
    }
  }

  /**
   *  resume processes
   */
  function resumeProcesses() {
    for (var i = 0, length = currentProcesses.length; i < length; i++) {
      currentProcesses[i].resume();
    }
  }

  var Processor = new Process();
  Processor.execute = execute;
  Processor.executeProcesses = executeProcesses;
  Processor.add = add;
  Processor.processCompleteHandler = processCompleteHandler;
  Processor.pauseProcesses = pauseProcesses;
  return Processor;
};

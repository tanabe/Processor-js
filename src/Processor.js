/**
 * command pattern like library
 * (c) Hideaki Tanabe <http://blog.kaihatsubu.com>
 * Licensed under the MIT License.
 */
(function(window) {

  /**
   * Process class constructor
   * @name Process
   * @class
   * @return 
   */
  var Process = function() {

    var result = {};
    var callbacks = [];

    /**
     * execute process abstract function
     * @name execute
     * @function
     */
    function execute() {
      done();
    }

    /**
     * pause process abstract function 
     * @name pause
     * @function
     */
    function pause() {
    }

    /**
     * reusme process abstract function
     * @name resume
     * @function
     */
    function resume() {
    }

    /**
     * done
     * @name done
     * @function
     */
    function done() {
      //fire callbacks
      for (var i = 0, length = callbacks.length; i < length; i++) {
        callbacks[i].callback.apply(callbacks[i].scope, [this]);
      }
    }

    /**
     * set result object
     * @name setResult
     * @function
     * @param result result object
     */
    function setResult(result) {
      this.result = result;
    }

    /**
     * set callback function
     * @name addCallback
     * @function
     * @param scope owner of callback function
     * @param callback this function will fire after previous process
     */
    function addCallback(scope, callback) {
      callbacks.push({scope: scope, callback: callback});
    }

    /**
     * unset callback function
     * @name removeCallback
     * @function
     * @param callback callback function
     */
    function removeCallback(callback) {
      for (var i = 0, length = callback.length; i < length; i++) {
        if (callbacks[i].callback == callback) {
          callbacks.splice(i, 1);
          return;
        }
      }
    }

    //create inner object
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
   * Processor class extends Process
   * @name Processor
   * @class
   */
  var Processor = function() {

    var processQueue = [];
    var currentProcesses = [];
    var running = false;
    var executed = false;
    var leftProcessesTotal = 0;
    var total = 0;
    var runningProcessor = null;

    /**
     * 
     * @name execute
     * @function
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
     * execute processes
     * @name executeProcesses
     * @function
     * @return 
     */
    function executeProcesses() {
      if (processQueue.length > 0) {
        currentProcesses = processQueue.shift();
        leftProcessesTotal = currentProcesses.length;
        for (var i = 0, length = currentProcesses.length; i < length; i++) {
          var process = currentProcesses[i];
          process.setResult(this.result);
          process.addCallback(this, processCompleteHandler);
          if (process.isProcessor) {
            runningProcessor = process;
          }
          process.execute();
        }
      } else {
        this.done();
      }
    }

    /**
     * process complete handler
     * @name processCompleteHandler
     * @function
     * @param process process
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
     * add process to end of the queue 
     * @name add
     * @function
     * @param any processes (arguments)
     * @return self
     */
    function add() {
      processQueue.push([].slice.call(arguments));
      return this;
    }

    /**
     * add process to start of the queue
     * @name insertBefore
     * @function
     * @param any processes (arguments)
     * @return self
     */
    function insertBefore() {
      processQueue.unshift([].slice.call(arguments));
      return this;
    }

    /**
     * pause processes
     * @name pauseProcesses
     * @function
     */
    function pauseProcesses() {
      for (var i = 0, length = currentProcesses.length; i < length; i++) {
        currentProcesses[i].pause();
      }
    }

    /**
     * resume processes
     * @name resumeProcesses
     * @function
     */
    function resumeProcesses() {
      for (var i = 0, length = currentProcesses.length; i < length; i++) {
        currentProcesses[i].resume();
      }
    }

    /**
     * get running child processor
     * @name getRunningProcessor
     * @function
     * @return running child processor
     */
    function getRunningProcessor() {
      return runningProcessor;
    }

    //create inner object
    var Processor = new Process();
    Processor.execute = execute;
    Processor.executeProcesses = executeProcesses;
    Processor.add = add;
    Processor.insertBefore = insertBefore;
    Processor.processCompleteHandler = processCompleteHandler;
    Processor.pauseProcesses = pauseProcesses;
    Processor.getRunningProcessor = getRunningProcessor;
    Processor.isProcessor = true;
    return Processor;
  }

  //assign to global
  window.Process = Process;
  window.Processor = Processor;
})(window);

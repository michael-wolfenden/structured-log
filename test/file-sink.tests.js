var serilog = require('../src/core/structured-log.js');
var file = require('../src/npm/file-sink.js');
var assert = require('assert');
var fs = require('fs');
var rimraf = require('rimraf');

describe('FileSink', function() {
  beforeEach(function(){
    if (!fs.existsSync('tmp')){
      fs.mkdirSync('tmp');
    }
  });

  afterEach(function(){
    rimraf.sync('tmp');
  });

  it('should write events', function(done){
    var log = serilog.configure()
      .writeTo(file('tmp/file-sink-test1.txt'))
      .create();

    log('Hello, world!');
    log.error('Bork!');

    log.close(function(){
      var content = fs.readFileSync('tmp/file-sink-test1.txt', {encoding: 'utf-8'});
      assert(content.indexOf('Hello') !== -1);
      assert(content.indexOf('Bork') !== -1);
      done();
    });
  });

  it('should format events as JSON', function(done){
    var log = serilog.configure()
      .writeTo(file('tmp/file-sink-test2.jsnl', {format: 'JSON'}))
      .create();

    log('Hello, {name}!', 'world');

    log.close(function(){
      var content = fs.readFileSync('tmp/file-sink-test2.jsnl', {encoding: 'utf-8'});
      var jvent = JSON.parse(content);
      assert(jvent.message === 'Hello, world!');
      assert(jvent.messageTemplate === 'Hello, {name}!');
      assert(jvent.properties.name === 'world');
      assert(jvent.level === 'INFO');
      done();
    });
  });
});

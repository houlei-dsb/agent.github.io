// Node.js 16 polyfill for global crypto
if (typeof global.crypto === 'undefined') {
  const crypto = require('crypto');
  global.crypto = crypto.webcrypto || crypto;
}

// Node.js 16 polyfill for ReadableStream with proper methods
if (typeof global.ReadableStream === 'undefined') {
  const { Readable } = require('stream');
  
  global.ReadableStream = class ReadableStream {
    constructor(underlyingSource) {
      this.readable = new Readable({
        read() {
          if (underlyingSource && underlyingSource.start) {
            underlyingSource.start({
              enqueue: (chunk) => this.readable.push(chunk),
              close: () => this.readable.push(null),
              error: (err) => this.readable.destroy(err)
            });
          }
        }
      });
    }
    
    getReader() {
      return {
        read: async () => {
          return new Promise((resolve) => {
            this.readable.once('data', (chunk) => {
              resolve({ value: chunk, done: false });
            });
            this.readable.once('end', () => {
              resolve({ value: undefined, done: true });
            });
          });
        },
        releaseLock: () => {}
      };
    }
  };
}

// Node.js 16 polyfill for AbortSignal.timeout
if (typeof AbortSignal.timeout !== 'function') {
  AbortSignal.timeout = function(ms) {
    const controller = new AbortController();
    setTimeout(() => controller.abort(), ms);
    return controller.signal;
  };
}

// Node.js 16 polyfill for Blob
if (typeof global.Blob === 'undefined') {
  global.Blob = require('buffer').Blob;
}

// Node.js 16 polyfill for Headers
if (typeof global.Headers === 'undefined') {
  global.Headers = class Headers {
    constructor(init) {
      this._headers = {};
      if (init) {
        for (const [key, value] of Object.entries(init)) {
          this.set(key, value);
        }
      }
    }
    set(key, value) {
      this._headers[key.toLowerCase()] = String(value);
    }
    get(key) {
      return this._headers[key.toLowerCase()] || null;
    }
    has(key) {
      return key.toLowerCase() in this._headers;
    }
    delete(key) {
      delete this._headers[key.toLowerCase()];
    }
    entries() {
      return Object.entries(this._headers)[Symbol.iterator]();
    }
    keys() {
      return Object.keys(this._headers)[Symbol.iterator]();
    }
    values() {
      return Object.values(this._headers)[Symbol.iterator]();
    }
    [Symbol.iterator]() {
      return this.entries();
    }
  };
}

// Node.js 16 polyfill for fetch
if (typeof global.fetch === 'undefined') {
  global.fetch = require('node-fetch');
  global.Request = require('node-fetch').Request;
  global.Response = require('node-fetch').Response;
}

// Now load the main module
require('./dist/main.js');

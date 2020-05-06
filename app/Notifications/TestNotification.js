"use strict"

class TestNotification {
    static get type () {
      return 'test'
    }
  
    via () {
      return ['database']
    }
  
    toJSON () {
      return {
        foo: 'bar'
      }
    }
  }
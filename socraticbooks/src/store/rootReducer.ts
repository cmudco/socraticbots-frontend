// src/store/rootReducer.ts
import { combineReducers } from '@reduxjs/toolkit'

const rootReducer = combineReducers({
  // We'll add actual reducers here later
  dummy: (state = null) => state
})

export default rootReducer
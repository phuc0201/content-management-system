import { configureStore } from "@reduxjs/toolkit";
import { setupListeners } from "@reduxjs/toolkit/query";
import { aboutApii } from "./services/about.service";
import { baseApi } from "./services/base.service";

export const store = configureStore({
  reducer: { [baseApi.reducerPath]: baseApi.reducer, [aboutApii.reducerPath]: aboutApii.reducer, },
  middleware: (getDefaultMiddleware) => getDefaultMiddleware().concat(baseApi.middleware, aboutApii.middleware),
});
setupListeners(store.dispatch);

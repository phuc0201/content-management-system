import { configureStore, type Middleware, type Reducer } from "@reduxjs/toolkit";
import { setupListeners } from "@reduxjs/toolkit/query";
import { allRTKServices } from "./services/axiosInstance/allRTKServices";

const reducers = Object.values(allRTKServices).reduce<Record<string, Reducer>>((acc, service) => {
  acc[service.reducerPath] = service.reducer;
  return acc;
}, {});

const serviceMiddlewares = Object.values(allRTKServices).map(
  (service) => service.middleware as Middleware,
);

export const store = configureStore({
  reducer: reducers,
  middleware: (getDefaultMiddleware) => getDefaultMiddleware().concat(...serviceMiddlewares),
});
setupListeners(store.dispatch);

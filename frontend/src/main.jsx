import React from "react";
import ReactDOM from "react-dom/client";
import {
  createBrowserRouter,
  createRoutesFromElements,
  Route,
  RouterProvider,
} from "react-router-dom";
import App from "./App.jsx";
import "bootstrap/dist/css/bootstrap.min.css";
import "./index.css";
import PrivateRoute from "./components/PrivateRoute.jsx";
import HomeScreen from "./screens/HomeScreen.jsx";
import LoginScreen from "./screens/LoginScreen.jsx";
import RegisterScreen from "./screens/RegisterScreen.jsx";
import NotFoundScreen from "./screens/NotFoundScreen.jsx";
import store from "./store.js";
import { Provider } from "react-redux";
import { GoogleOAuthProvider } from "@react-oauth/google";
import ErrorBoundary from "./screens/ErrorBoundary.jsx";

const router = createBrowserRouter(
  createRoutesFromElements(
    <Route path="/" element={<App></App>}>
      <Route path="/login" element={<LoginScreen></LoginScreen>}></Route>
      <Route
        path="/register"
        element={<RegisterScreen></RegisterScreen>}
      ></Route>

      <Route path="" element={<PrivateRoute />}>
        <Route index path="/" element={<HomeScreen></HomeScreen>}></Route>
      </Route>
      <Route path="*" element={<NotFoundScreen />} />
    </Route>
  )
);

ReactDOM.createRoot(document.getElementById("root")).render(
  <Provider store={store}>
    <GoogleOAuthProvider clientId="684114676709-5r4de1pbjcdhccojbdmtrpcoc46e3bv4.apps.googleusercontent.com">
    <ErrorBoundary>
        <RouterProvider router={router} />
      </ErrorBoundary>
    </GoogleOAuthProvider>
  </Provider>
);

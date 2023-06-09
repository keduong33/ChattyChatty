import {
  createBrowserRouter,
  RouterProvider as RRProvider,
} from "react-router-dom";
import { IndexPage } from "../views/_index";
import { DialoguePage } from "../views/_dialogue";
import { TestPage } from "../views/_test";

const router = createBrowserRouter([
  {
    path: "/",
    element: <IndexPage />,
    errorElement: <div>Error Index Page</div>,
  },
  {
    path: "/dialogue",
    element: <DialoguePage />,
  },
  {
    path: "/test",
    element: <TestPage />,
  },
]);

export default function RouterProvider() {
  return <RRProvider router={router} />;
}

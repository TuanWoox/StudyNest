// App.tsx or main.tsx
import { RouterProvider } from "react-router-dom";
import { router } from "./Router";
import { Toaster } from "sonner";
import { Provider } from "react-redux";
import { store } from "./store/store";
import { QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import queryClient from "@/config/reactQueryConfig";
import { QuizAttemptSnapshotHubProvider } from "./context/QuizSnapshotHubProvider/QuizSnapshotHubProvider";
import { QuizJobProvider } from "@/context/QuizJobProvider/QuizJobProvider";
import AuthProvider from "./context/AuthProvider/AuthProvider";

function App() {
  return (
    <Provider store={store}>
      <QueryClientProvider client={queryClient}>
        <AuthProvider>
          <QuizJobProvider>
            <QuizAttemptSnapshotHubProvider>
              <RouterProvider router={router}></RouterProvider>
              <ReactQueryDevtools initialIsOpen={false} />
            </QuizAttemptSnapshotHubProvider>
          </QuizJobProvider>
        </AuthProvider>
        <Toaster richColors expand={false} position="top-right" closeButton />
      </QueryClientProvider>
    </Provider>
  );
}

export default App;

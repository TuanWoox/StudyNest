// App.tsx or main.tsx
import { RouterProvider } from "react-router-dom";
import { router } from "./Router";
import { Toaster } from 'sonner';
import { Provider } from "react-redux";
import { store } from "./store/store";
import { QueryClientProvider } from "@tanstack/react-query"
import { ReactQueryDevtools } from '@tanstack/react-query-devtools'
import queryClient from "@/config/reactQueryConfig";
import { QuizAttemptSnapshotHubProvider } from "./context/QuizSnapshotHubContext/QuizSnapshotHubProvider";
import { AuthProvider } from "./context/AuthContext/AuthProvider";

function App() {
  return (
    <Provider store={store}>
      <AuthProvider>
        <QueryClientProvider client={queryClient}>
          <QuizAttemptSnapshotHubProvider>
            <RouterProvider router={router} ></RouterProvider>
            {/* <ReactQueryDevtools initialIsOpen={false} /> */}
          </QuizAttemptSnapshotHubProvider>
          <Toaster richColors expand={false} position="top-right" closeButton />
        </QueryClientProvider>
      </AuthProvider>
    </Provider>
  );
}


export default App;

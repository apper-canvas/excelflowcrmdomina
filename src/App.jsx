import React from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { ToastContainer } from "react-toastify";
import Layout from "@/components/organisms/Layout";
import ContactsPage from "@/components/pages/ContactsPage";
import DealsPage from "@/components/pages/DealsPage";
import CompaniesPage from "@/components/pages/CompaniesPage";
import TasksPage from "@/components/pages/TasksPage";
import ReportsPage from "@/components/pages/ReportsPage";
import ContactDetailView from "@/components/pages/ContactDetailView";
import DealDetailView from "@/components/pages/DealDetailView";
import TaskDetailView from "@/components/pages/TaskDetailView";
import ActivityDetailView from "@/components/pages/ActivityDetailView";

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('React Error Boundary caught an error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="text-center">
            <h1 className="text-xl font-semibold text-gray-900 mb-2">
              Something went wrong
            </h1>
            <p className="text-gray-600 mb-4">
              Please refresh the page to try again.
            </p>
            <button
              onClick={() => window.location.reload()}
              className="px-4 py-2 bg-primary-500 text-white rounded-md hover:bg-primary-600"
            >
              Refresh Page
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
function App() {
  return (
    <ErrorBoundary>
      <BrowserRouter>
      <div className="min-h-screen bg-gray-50">
        <Routes>
<Route path="/" element={<Layout />}>
            <Route index element={<Navigate to="/reports" replace />} />
            <Route path="contacts" element={<ContactsPage />} />
            <Route path="deals" element={<DealsPage />} />
            <Route path="companies" element={<CompaniesPage />} />
            <Route path="tasks" element={<TasksPage />} />
            <Route path="reports" element={<ReportsPage />} />
            <Route path="reports/contacts" element={<ContactDetailView />} />
            <Route path="reports/deals" element={<DealDetailView />} />
            <Route path="reports/tasks" element={<TaskDetailView />} />
            <Route path="reports/activity" element={<ActivityDetailView />} />
          </Route>
        </Routes>
        
        <ToastContainer
          position="top-right"
          autoClose={3000}
          hideProgressBar={false}
          newestOnTop={false}
          closeOnClick
          rtl={false}
          pauseOnFocusLoss
          draggable
          pauseOnHover
          className="toast-container"
          style={{ zIndex: 9999 }}
        />
      </div>
</BrowserRouter>
    </ErrorBoundary>
  );
}

export default App;
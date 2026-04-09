import { BrowserRouter, Routes, Route } from "react-router-dom";
import Login from "./pages/LoginPage/LoginPage";
import Home from "./pages/Home/Home";
import AppointmentsAdmin from "./pages/Admin/AppointmentsAdmin/AppointmentsAdmin";
import EmployeesAdmin from "./pages/Admin/EmployeesAdmin/EmployeesAdmin";
import ProtectedRoute from "./components/ProtectedRoute"; // Импортируем обертку

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Публичные роуты */}
        <Route path='/login' element={<Login/>} />
        <Route path='/' element={<Home/>} />

        {/* Защищенные роуты */}
        <Route 
          path='/admin' 
          element={
            <ProtectedRoute>
              <AppointmentsAdmin/>
            </ProtectedRoute>
          } 
        />
        <Route 
          path='/admin/employees' 
          element={
            <ProtectedRoute>
              <EmployeesAdmin/>
            </ProtectedRoute>
          } 
        />

      </Routes>
    </BrowserRouter>
  );
}

export default App;
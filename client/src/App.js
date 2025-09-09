import { BrowserRouter, Routes, Route } from "react-router-dom";
import Login from "./pages/LoginPage/LoginPage";
import { useState } from "react";
import Home from "./pages/Home/Home";
import AppointmentsAdmin from "./pages/Admin/AppointmentsAdmin/AppointmentsAdmin";
import EmployeesAdmin from "./pages/Admin/EmployeesAdmin/EmployeesAdmin";
import StatisticsAdmin from "./pages/Admin/StatisticsAdmin/StatisticsAdmin";

function App() {


  return (
    <BrowserRouter>
      <Routes>
        <Route path='/login' element={<Login/>} />
        <Route path='/' element={<Home/>} />
        <Route path='/admin' element={<AppointmentsAdmin/>} />
        <Route path='/admin/employees' element={<EmployeesAdmin/>} />
        <Route path='/admin/statistics' element={<StatisticsAdmin/>} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;

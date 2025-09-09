import { BrowserRouter, Routes, Route } from "react-router-dom";
import Login from "./pages/LoginPage/LoginPage";
import { useState } from "react";
import Home from "./pages/Home/Home";
import AppointmentsAdmin from "./pages/Admin/AppointmentsAdmin/AppointmentsAdmin";

function App() {


  return (
    <BrowserRouter>
      <Routes>
        <Route path='/login' element={<Login/>} />
        <Route path='/' element={<Home/>} />
        <Route path='/admin' element={<AppointmentsAdmin/>} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;

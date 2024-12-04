import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import ProductList from './pages/ProductList';
import ProductDetails from './pages/ProductDetails';
import AddProduct from './pages/AddProduct';
import EditProduct from './pages/EditProduct';
import Header from './components/Header';
import Footer from './components/Footer';
import Cart from './pages/Cart';
import { AuthProvider } from './context/AuthContext';
import Login from './pages/Login';
import Register from './pages/Register';
import Profile from './pages/Profile';
import ProtectedRoute from './components/ProtectedRoute';
import OrderConfirm from './pages/OrderConfirm';
import Payment from './pages/Payment';
import OrderSuccess from './pages/OrderSuccess';
import OrderList from './pages/OrderList';
import OrderDetail from './pages/OrderDetail';
import AdminOrders from './pages/AdminOrders';

function App() {
  return (
    <AuthProvider>
      {
        <Router>
          <div style={styles.app}>
            <Header />
            <main style={styles.main}>
              <Routes>
                <Route path="/" element={<ProductList />} />
                <Route path="/products/:id" element={<ProductDetails />} />
                <Route path="/products/new" element={<ProtectedRoute adminOnly><AddProduct /></ProtectedRoute>} />
                <Route path="/products/:id/edit" element={<ProtectedRoute adminOnly><EditProduct /></ProtectedRoute>} />
                <Route path="/cart" element={<Cart />} />
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />
                <Route
                  path="/profile"
                  element={
                    <ProtectedRoute>
                      <Profile />
                    </ProtectedRoute>
                  }
                />
                <Route 
                  path="/order-confirm" 
                  element={
                    <ProtectedRoute>
                      <OrderConfirm />
                    </ProtectedRoute>
                  } 
                />
                <Route 
                  path="/payment/:orderId" 
                  element={
                    <ProtectedRoute>
                      <Payment />
                    </ProtectedRoute>
                  } 
                />
                <Route 
                  path="/order-success/:orderId" 
                  element={
                    <ProtectedRoute>
                      <OrderSuccess />
                    </ProtectedRoute>
                  } 
                />
                <Route 
                  path="/orders" 
                  element={
                    <ProtectedRoute>
                      <OrderList />
                    </ProtectedRoute>
                  } 
                />
                <Route 
                  path="/order/:id" 
                  element={
                    <ProtectedRoute>
                      <OrderDetail />
                    </ProtectedRoute>
                  } 
                />
                <Route 
                  path="/admin/orders" 
                  element={
                    <ProtectedRoute>
                      <AdminOrders />
                    </ProtectedRoute>
                  } 
                />
              </Routes>
            </main>
            <Footer />
          </div>
        </Router>
      }
    </AuthProvider>
  );
}

const styles = {
  app: {
    display: 'flex',
    flexDirection: 'column',
    minHeight: '100vh',
  },
  main: {
    flex: 1,
    padding: '20px',
  },
};

export default App;

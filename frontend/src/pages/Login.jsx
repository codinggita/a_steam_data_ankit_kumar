import React, { useEffect } from 'react';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import { useDispatch, useSelector } from 'react-redux';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { TextField, Button, Box, Typography, Paper, CircularProgress } from '@mui/material';
import { loginUser } from '../store/slices/authSlice';
import { useToast } from '../components/ToastNotification';
import SEO from '../components/SEO';

export const Login = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const showToast = useToast();
  const { loading, error, isAuthenticated } = useSelector((state) => state.auth);

  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated) {
      const from = location.state?.from?.pathname || '/dashboard';
      navigate(from, { replace: true });
    }
  }, [isAuthenticated, navigate, location]);

  const formik = useFormik({
    initialValues: {
      email: '',
      password: '',
    },
    validationSchema: Yup.object({
      email: Yup.string().email('Invalid email address').required('Email is required'),
      password: Yup.string().required('Password is required'),
    }),
    onSubmit: (values) => {
      dispatch(loginUser(values))
        .unwrap()
        .then(() => {
          showToast('Welcome back! Login successful.', 'success');
        })
        .catch((err) => {
          showToast(err || 'Invalid email or password.', 'error');
        });
    },
  });

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-950 px-4 py-12 sm:px-6 lg:px-8">
      <SEO title="Sign In" description="Access your Steamax dashboard to inspect system metrics and manage game catalogs." />
      
      <div className="w-full max-w-md space-y-8">
        <div className="flex flex-col items-center">
          <h2 className="mt-6 text-center text-4xl font-extrabold tracking-tight text-white">
            Welcome Back
          </h2>
          <p className="mt-2 text-center text-sm text-slate-400">
            Sign in to start exploring game metrics
          </p>
        </div>

        <Paper
          elevation={24}
          className="bg-slate-900 border border-slate-800 rounded-3xl p-8"
          style={{ backgroundColor: '#1e293b' }}
        >
          <form onSubmit={formik.handleSubmit} className="space-y-6">
            <TextField
              fullWidth
              id="email"
              name="email"
              label="Email Address"
              value={formik.values.email}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              error={formik.touched.email && Boolean(formik.errors.email)}
              helperText={formik.touched.email && formik.errors.email}
              variant="outlined"
              InputLabelProps={{ style: { color: '#94a3b8' } }}
              inputProps={{ style: { color: '#f8fafc' } }}
              sx={{
                '& .MuiOutlinedInput-root': {
                  '& fieldset': { borderColor: '#475569' },
                  '&:hover fieldset': { borderColor: '#06b6d4' },
                  '&.Mui-focused fieldset': { borderColor: '#06b6d4' },
                },
              }}
            />

            <TextField
              fullWidth
              id="password"
              name="password"
              label="Password"
              type="password"
              value={formik.values.password}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              error={formik.touched.password && Boolean(formik.errors.password)}
              helperText={formik.touched.password && formik.errors.password}
              variant="outlined"
              InputLabelProps={{ style: { color: '#94a3b8' } }}
              inputProps={{ style: { color: '#f8fafc' } }}
              sx={{
                '& .MuiOutlinedInput-root': {
                  '& fieldset': { borderColor: '#475569' },
                  '&:hover fieldset': { borderColor: '#06b6d4' },
                  '&.Mui-focused fieldset': { borderColor: '#06b6d4' },
                },
              }}
            />

            <div className="flex items-center justify-between">
              <Link
                to="/forgot-password"
                className="text-xs font-semibold text-cyan-400 hover:text-cyan-300 hover:underline"
              >
                Forgot your password?
              </Link>
            </div>

            <Button
              color="primary"
              variant="contained"
              fullWidth
              type="submit"
              disabled={loading}
              className="bg-cyan-600 hover:bg-cyan-500 py-3 rounded-xl font-bold transition-all hover:scale-[1.02] active:scale-[0.98]"
              style={{ backgroundColor: '#0891b2', color: '#ffffff', textTransform: 'none', fontWeight: 'bold' }}
            >
              {loading ? <CircularProgress size={24} color="inherit" /> : 'Sign In'}
            </Button>
          </form>

          <div className="mt-6 text-center text-sm text-slate-400">
            Don't have an account?{' '}
            <Link to="/register" className="font-semibold text-cyan-400 hover:text-cyan-300 hover:underline">
              Register here
            </Link>
          </div>
        </Paper>
      </div>
    </div>
  );
};

export default Login;

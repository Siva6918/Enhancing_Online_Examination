import React, { useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Grid, Box, Card, Stack, Typography, Button } from '@mui/material';
import PageContainer from 'src/components/container/PageContainer';
import AuthLogin from './auth/AuthLogin';
import { useFormik } from 'formik';
import * as yup from 'yup';
import { useDispatch, useSelector } from 'react-redux';
import { useLoginMutation } from './../../slices/usersApiSlice';
import { setCredentials } from './../../slices/authSlice';
import { toast } from 'react-toastify';
import Loader from './Loader';
import AI from './AI.png'; // <-- Import from same folder

const userValidationSchema = yup.object({
  email: yup.string().email('Enter a valid email').required('Email is required'),
  password: yup.string().min(8, 'Password should be minimum 8 characters').required('Password is required'),
});

const initialUserValues = { email: '', password: '' };

const Login = () => {
  const formik = useFormik({
    initialValues: initialUserValues,
    validationSchema: userValidationSchema,
    onSubmit: (values) => handleSubmit(values),
  });

  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [login, { isLoading }] = useLoginMutation();
  const { userInfo } = useSelector((state) => state.auth);

  useEffect(() => {
    if (userInfo) navigate('/');
  }, [navigate, userInfo]);

  const handleSubmit = async ({ email, password }) => {
    try {
      const res = await login({ email, password }).unwrap();
      dispatch(setCredentials({ ...res }));
      formik.resetForm();

      const redirectLocation = JSON.parse(localStorage.getItem('redirectLocation'));
      if (redirectLocation) {
        localStorage.removeItem('redirectLocation');
        navigate(redirectLocation.pathname);
      } else {
        navigate('/');
      }
    } catch (err) {
      toast.error(err?.data?.message || err.error);
    }
  };

  return (
    <PageContainer title="Login" description="AI Exam Login">
      <Grid container sx={{ minHeight: '100vh' }}>
        {/* Left Side - Creative UI */}
        <Grid
          item
          xs={12}
          md={7}
          sx={{
            position: 'relative',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            overflow: 'hidden',
            background: 'linear-gradient(135deg, #667eea, #764ba2)',
            color: '#fff',
            flexDirection: 'column',
            p: 4,
          }}
        >
          {/* Floating decorative elements */}
          <Box
            sx={{
              position: 'absolute',
              width: 300,
              height: 300,
              background: 'radial-gradient(circle, rgba(255,255,255,0.2), transparent 70%)',
              borderRadius: '50%',
              top: 50,
              left: 100,
              animation: 'floatLeft 12s ease-in-out infinite alternate',
            }}
          />
          <Box
            sx={{
              position: 'absolute',
              width: 150,
              height: 150,
              background: 'radial-gradient(circle, rgba(255,255,255,0.15), transparent 70%)',
              borderRadius: '50%',
              bottom: 50,
              right: 120,
              animation: 'floatLeft 10s ease-in-out infinite alternate-reverse',
            }}
          />

          {/* Core creative content */}
          <Box sx={{ zIndex: 2, textAlign: 'center', maxWidth: 500 }}>
            <Typography
              variant="h2"
              sx={{
                fontWeight: 700,
                mb: 2,
                textShadow: '2px 2px 15px rgba(0,0,0,0.4)',
              }}
            >
              Welcome to AI_Evalu8
            </Typography>
            <Typography variant="h5" sx={{ fontWeight: 400, mb: 4 }}>
              Take online exams securely with AI monitoring and instant evaluations.
            </Typography>

            {/* AI Illustration from same folder */}
            <Box
              component="img"
              src={AI}
              alt="AI Dashboard"
              sx={{
                width: '100%',
                maxWidth: 350,
                borderRadius: 3,
                boxShadow: '0 0 30px rgba(0,0,0,0.3)',
              }}
            />
          </Box>
        </Grid>

        {/* Right Side - Login Form */}
        <Grid
          item
          xs={12}
          md={5}
          sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: '#f5f7fa',
            position: 'relative',
          }}
        >
          <Card
            elevation={12}
            sx={{
              p: 5,
              borderRadius: 4,
              backdropFilter: 'blur(10px)',
              backgroundColor: 'rgba(255, 255, 255, 0.95)',
              border: '1px solid rgba(0,0,0,0.1)',
              width: '90%',
              maxWidth: 450,
              textAlign: 'center',
            }}
          >
            <Typography variant="h3" sx={{ fontWeight: 700, color: '#1976d2', mb: 2 }}>
              AI_Evalu8 Login
            </Typography>
            <Typography variant="subtitle1" sx={{ color: '#555', mb: 4 }}>
              Enter your credentials to continue
            </Typography>

            <AuthLogin formik={formik} />

            <Stack direction="row" spacing={1} justifyContent="center" mt={4}>
              <Typography color="#555" variant="body1">
                New here?
              </Typography>
              <Link to="/auth/register" style={{ textDecoration: 'none' }}>
                <Button variant="contained" sx={{ background: '#1976d2', color: '#fff' }}>
                  Create Account
                </Button>
              </Link>
            </Stack>
            {isLoading && <Loader />}
          </Card>
        </Grid>
      </Grid>

      {/* Animations */}
      <style>
        {`
          @keyframes floatLeft {
            0% { transform: translateY(0) translateX(0); }
            50% { transform: translateY(-25px) translateX(20px); }
            100% { transform: translateY(0) translateX(0); }
          }
        `}
      </style>
    </PageContainer>
  );
};

export default Login;
